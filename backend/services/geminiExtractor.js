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

IMPORTANT INSTRUCTIONS:
1. Extract ALL transactions found in the document
2. Identify bank account details if present
3. Identify any investment holdings (stocks, mutual funds, bonds) if present
4. Return data in VALID JSON format only - no markdown, no code blocks, no explanations
5. Use the exact structure provided below
6. For dates, use ISO 8601 format (YYYY-MM-DD)
7. For transaction types: use "debit" or "credit" only
8. For instrument types: use "MF", "Equity", or "Bond" only
9. If information is missing, use empty strings or 0 for numbers
10. Categorize transactions intelligently based on description

EXPECTED JSON STRUCTURE:
{
  "bankAccounts": [
    {
      "accountType": "Savings/Current/Credit Card",
      "accountNumberMasked": "XXXX-XXXX-1234",
      "ifsc": "IFSC code",
      "currentBalance": 0,
      "currency": "INR",
      "bankName": "Bank name"
    }
  ],
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "amount": 0,
      "type": "debit/credit",
      "description": "Transaction description",
      "category": "Food/Transport/Salary/Investment/Bills/Shopping/Healthcare/Entertainment/Other",
      "balance": 0,
      "metadata": {
        "mode": "UPI/Card/Net Banking/Cash/Cheque",
        "reference": "Transaction reference number",
        "merchant": "Merchant or payee name"
      }
    }
  ],
  "holdings": [
    {
      "instrumentName": "Instrument name",
      "instrumentType": "MF/Equity/Bond",
      "quantity": 0,
      "averageBuyPrice": 0,
      "currentPrice": 0,
      "symbol": "Trading symbol",
      "isin": "ISIN code"
    }
  ]
}

DOCUMENT TEXT:
${pdfText}

Extract and return ONLY the JSON object with the financial data. No explanations, no markdown formatting.`;
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
   * Sanitize and clean extracted data
   */
  sanitizeExtractedData(data) {
    // Clean bank accounts - remove entries missing critical fields
    const sanitizedBankAccounts = data.bankAccounts
      .filter(account => account && typeof account === 'object')
      .map(account => ({
        accountType: account.accountType || 'Savings',
        accountNumberMasked: account.accountNumberMasked || account.accountNumber || 'XXXX',
        ifsc: account.ifsc || '',
        currentBalance: parseFloat(account.currentBalance) || 0,
        currency: account.currency || 'INR',
        bankName: account.bankName || 'Unknown Bank',
        lastUpdated: account.lastUpdated || new Date().toISOString(),
        createdAt: account.createdAt || new Date().toISOString()
      }))
      .filter(account => account.accountNumberMasked !== 'XXXX' || account.bankName !== 'Unknown Bank');

    // Clean transactions - remove invalid entries
    const sanitizedTransactions = data.transactions
      .filter(txn => txn && typeof txn === 'object')
      .filter(txn => txn.date && txn.amount && ['debit', 'credit'].includes(txn.type))
      .map(txn => ({
        date: new Date(txn.date),
        amount: parseFloat(txn.amount),
        type: txn.type,
        description: txn.description || 'Transaction',
        category: txn.category || 'Other',
        currency: txn.currency || 'INR',
        metadata: {
          mode: txn.metadata?.mode || txn.mode || '',
          reference: txn.metadata?.reference || txn.reference || '',
          merchant: txn.metadata?.merchant || txn.merchant || ''
        }
      }));

    // Clean holdings - remove entries with invalid data
    const sanitizedHoldings = data.holdings
      .filter(holding => holding && typeof holding === 'object')
      .filter(holding => 
        holding.instrumentName && 
        ['MF', 'Equity', 'Bond'].includes(holding.instrumentType) &&
        holding.quantity > 0 &&
        holding.averageBuyPrice > 0
      )
      .map(holding => ({
        instrumentName: holding.instrumentName,
        instrumentType: holding.instrumentType,
        quantity: parseFloat(holding.quantity),
        averageBuyPrice: parseFloat(holding.averageBuyPrice),
        currentPrice: parseFloat(holding.currentPrice) || parseFloat(holding.averageBuyPrice),
        currency: holding.currency || 'INR',
        purchaseDate: holding.purchaseDate || new Date().toISOString()
      }));

    return {
      bankAccounts: sanitizedBankAccounts,
      transactions: sanitizedTransactions,
      holdings: sanitizedHoldings
    };
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
