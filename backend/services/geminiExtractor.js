import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI - the client gets API key from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

/**
 * Gemini AI Service for extracting structured financial data from PDF text
 */
class GeminiFinancialExtractor {
  constructor() {
    this.ai = ai;
  }

  /**
   * Generate prompt for extracting financial data from bank statements
   */
  generateExtractionPrompt(pdfText) {
    return `You are a financial data extraction expert. Analyze the following bank statement or financial document text and extract structured data.

CRITICAL: Return data in the EXACT structure shown below. This structure matches our dashboard display requirements.

REQUIRED JSON STRUCTURE:
{
  "bankAccounts": [
    {
      "accountType": "Savings" | "Current" | "Credit",
      "accountNumberMasked": "XXXX1234",
      "ifsc": "BANK0001234",
      "currentBalance": 50000,
      "currency": "INR"
    }
  ],
  "transactions": [
    {
      "date": "2024-01-15",
      "amount": 5000,
      "type": "debit" | "credit",
      "description": "Grocery Shopping at BigBazaar",
      "category": "Food" | "Transport" | "Shopping" | "Entertainment" | "Bills" | "Healthcare" | "Investment" | "Salary" | "Other"
    }
  ],
  "holdings": [
    {
      "instrumentName": "Reliance Industries",
      "instrumentType": "Equity" | "MF",
      "category": "Stock" | "Mutual Fund" | "SIP",
      "quantity": 10,
      "averageBuyPrice": 2450.50,
      "currentPrice": 2580.75,
      "currency": "INR"
    }
  ]
}

EXTRACTION RULES:
1. TRANSACTIONS:
   - date: YYYY-MM-DD format
   - amount: Must be positive number (absolute value)
   - type: ONLY "debit" or "credit"
   - description: Clear transaction description
   - category: Choose from: Food, Transport, Shopping, Entertainment, Bills, Healthcare, Investment, Salary, Other
   - Intelligently categorize based on merchant/description (e.g., Swiggy→Food, Uber→Transport, Amazon→Shopping)

2. HOLDINGS (Stocks/Mutual Funds/SIPs):
   - instrumentName: Full name (e.g., "Reliance Industries", "HDFC Top 100 Fund")
   - instrumentType: "Equity" for stocks, "MF" for mutual funds/SIPs
   - category: "Stock" for equity shares, "Mutual Fund" for MF, "SIP" for SIP investments
   - quantity: Number of shares/units
   - averageBuyPrice: Average purchase price per unit (MUST be positive number)
   - currentPrice: Current market price (MUST be positive number, if not available use averageBuyPrice)
   - currency: Default "INR"

3. BANK ACCOUNTS:
   - accountType: "Savings", "Current", or "Credit"
   - accountNumberMasked: Last 4 digits with XXXX prefix (e.g., "XXXX1234")
   - ifsc: IFSC code if available
   - currentBalance: Current balance amount
   - currency: Default "INR"

4. CATEGORY INFERENCE:
   - If holding has "SIP" in name → category: "SIP"
   - If instrumentType is "Equity" → category: "Stock"
   - If instrumentType is "MF" and no SIP mention → category: "Mutual Fund"

5. DATA QUALITY:
   - All prices must be positive numbers > 0
   - Dates must be valid and parseable
   - Remove any entries with missing critical fields (amount, date, instrumentName)

DOCUMENT TEXT TO ANALYZE:
${pdfText}

RETURN ONLY THE JSON OBJECT - NO MARKDOWN, NO EXPLANATIONS, NO CODE BLOCKS.`;
  }

  /**
   * Extract financial data from PDF text using Gemini AI
   */
  async extractFinancialData(pdfText) {
    try {
      const prompt = this.generateExtractionPrompt(pdfText);
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      let text = response.text;
      
      // Clean up the response - remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse the JSON response
      const extractedData = JSON.parse(text);
      
      // Validate and normalize the structure
      const normalizedData = {
        bankAccounts: Array.isArray(extractedData.bankAccounts) ? extractedData.bankAccounts : [],
        transactions: Array.isArray(extractedData.transactions) ? extractedData.transactions : [],
        holdings: Array.isArray(extractedData.holdings) ? extractedData.holdings : []
      };

      // Sanitize the data to ensure all required fields are present
      const sanitizedData = this.sanitizeExtractedData(normalizedData);
      
      return {
        success: true,
        data: sanitizedData,
        metadata: {
          bankAccountsCount: sanitizedData.bankAccounts.length,
          transactionsCount: sanitizedData.transactions.length,
          holdingsCount: sanitizedData.holdings.length,
          rawCounts: {
            bankAccounts: normalizedData.bankAccounts.length,
            transactions: normalizedData.transactions.length,
            holdings: normalizedData.holdings.length
          },
          extractedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error extracting financial data:', error);
      
      // Return detailed error information
      return {
        success: false,
        error: {
          message: error.message,
          type: error.name,
          details: 'Failed to extract financial data from the document. Please ensure the document is a valid bank statement or financial document.'
        },
        data: {
          bankAccounts: [],
          transactions: [],
          holdings: []
        }
      };
    }
  }

  /**
   * Extract data with retry logic
   */
  async extractWithRetry(pdfText, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.extractFinancialData(pdfText);
      
      if (result.success) {
        return result;
      }
      
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt} for data extraction...`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    // Return the last failed attempt result
    return await this.extractFinancialData(pdfText);
  }

  /**
   * Sanitize and clean extracted data - Match dashboard display format exactly
   */
  sanitizeExtractedData(data) {
    // Clean bank accounts - Match dashboard structure
    const sanitizedBankAccounts = data.bankAccounts
      .filter(account => account && typeof account === 'object')
      .map(account => ({
        accountType: account.accountType || 'Savings',
        accountNumberMasked: account.accountNumberMasked || account.accountNumber || 'XXXX',
        ifsc: account.ifsc || '',
        currentBalance: parseFloat(account.currentBalance) || 0,
        currency: account.currency || 'INR'
      }))
      .filter(account => account.accountNumberMasked !== 'XXXX');

    // Clean transactions - Match dashboard transaction structure
    const sanitizedTransactions = data.transactions
      .filter(txn => txn && typeof txn === 'object')
      .filter(txn => txn.date && txn.amount && ['debit', 'credit'].includes(txn.type))
      .map(txn => {
        // Ensure absolute value for amount
        const amount = Math.abs(parseFloat(txn.amount));
        
        return {
          date: new Date(txn.date),
          amount: amount,
          type: txn.type,
          description: txn.description || 'Transaction',
          category: this.normalizeCategory(txn.category)
        };
      });

    // Clean holdings - Match dashboard holdings structure (Stock, Mutual Fund, SIP)
    const sanitizedHoldings = data.holdings
      .filter(holding => holding && typeof holding === 'object')
      .filter(holding => 
        holding.instrumentName && 
        holding.quantity > 0 &&
        holding.averageBuyPrice > 0
      )
      .map(holding => {
        // Auto-categorize based on instrumentType and name
        let category = holding.category;
        let instrumentType = holding.instrumentType;
        
        if (!category) {
          if (instrumentType === 'Equity') {
            category = 'Stock';
          } else if (instrumentType === 'MF') {
            // Check if it's a SIP
            category = holding.instrumentName?.toLowerCase().includes('sip') ? 'SIP' : 'Mutual Fund';
          } else {
            // Default to Mutual Fund for unknown types
            category = 'Mutual Fund';
            instrumentType = 'MF';
          }
        }

        // Ensure instrumentType is set correctly
        if (!instrumentType) {
          instrumentType = category === 'Stock' ? 'Equity' : 'MF';
        }

        const avgPrice = parseFloat(holding.averageBuyPrice);
        const currentPrice = parseFloat(holding.currentPrice) || avgPrice;

        return {
          instrumentName: holding.instrumentName,
          instrumentType: instrumentType,
          category: category,
          quantity: parseFloat(holding.quantity),
          averageBuyPrice: avgPrice,
          currentPrice: currentPrice,
          currency: holding.currency || 'INR'
        };
      });

    return {
      bankAccounts: sanitizedBankAccounts,
      transactions: sanitizedTransactions,
      holdings: sanitizedHoldings
    };
  }

  /**
   * Normalize transaction category to match dashboard categories
   */
  normalizeCategory(category) {
    if (!category) return 'Other';
    
    const validCategories = [
      'Food', 'Transport', 'Shopping', 'Entertainment', 
      'Bills', 'Healthcare', 'Investment', 'Salary', 'Other'
    ];
    
    // Find matching category (case-insensitive)
    const normalized = validCategories.find(
      cat => cat.toLowerCase() === category.toLowerCase()
    );
    
    return normalized || 'Other';
  }

  /**
   * Validate extracted data quality
   */
  validateExtractedData(data) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: []
    };

    // Check if at least some data was extracted
    const totalItems = 
      data.bankAccounts.length + 
      data.transactions.length + 
      data.holdings.length;

    if (totalItems === 0) {
      validation.isValid = false;
      validation.errors.push('No financial data could be extracted from the document');
    }

    // Validate bank accounts
    data.bankAccounts.forEach((account, index) => {
      if (!account.accountNumberMasked) {
        validation.warnings.push(`Bank account ${index + 1}: Missing account number`);
      }
      if (!account.bankName) {
        validation.warnings.push(`Bank account ${index + 1}: Missing bank name`);
      }
    });

    // Validate transactions
    data.transactions.forEach((txn, index) => {
      if (!txn.date) {
        validation.errors.push(`Transaction ${index + 1}: Missing date`);
        validation.isValid = false;
      }
      if (!txn.amount || txn.amount === 0) {
        validation.errors.push(`Transaction ${index + 1}: Invalid amount`);
        validation.isValid = false;
      }
      if (!['debit', 'credit'].includes(txn.type)) {
        validation.errors.push(`Transaction ${index + 1}: Invalid type (must be debit or credit)`);
        validation.isValid = false;
      }
    });

    // Validate holdings
    data.holdings.forEach((holding, index) => {
      if (!holding.instrumentName) {
        validation.errors.push(`Holding ${index + 1}: Missing instrument name`);
        validation.isValid = false;
      }
      if (!['MF', 'Equity', 'Bond'].includes(holding.instrumentType)) {
        validation.errors.push(`Holding ${index + 1}: Invalid instrument type`);
        validation.isValid = false;
      }
      if (holding.quantity <= 0) {
        validation.errors.push(`Holding ${index + 1}: Invalid quantity`);
        validation.isValid = false;
      }
    });

    return validation;
  }
}

export default new GeminiFinancialExtractor();
