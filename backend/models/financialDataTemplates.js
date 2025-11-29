/**
 * Firestore Data Structure Templates for Financial Data
 * These templates define the structure for storing user financial information
 */

/**
 * Bank Account Template
 * Collection: users/{userId}/bankAccounts/{bankAccountId}
 */
const bankAccountTemplate = {
  accountType: "",          // e.g., "Savings", "Current", "Credit Card"
  accountNumberMasked: "",  // e.g., "XXXX-XXXX-1234"
  ifsc: "",                 // IFSC code for the bank
  currentBalance: 0,        // Current balance in the account
  currency: "INR",          // Currency code
  bankName: "",             // Bank name (additional field for better context)
  createdAt: null,          // Timestamp when added
  updatedAt: null           // Timestamp when last updated
};

/**
 * Transaction Template
 * Collection: users/{userId}/transactions/{transactionId}
 */
const transactionTemplate = {
  date: null,               // Date of transaction (Firestore Timestamp)
  amount: 0,                // Transaction amount
  type: "",                 // "debit" or "credit"
  description: "",          // Transaction description/narration
  category: "",             // e.g., "Food", "Transport", "Salary", "Investment"
  bankAccountId: "",        // Reference to bank account
  balance: 0,               // Balance after transaction (optional)
  createdAt: null,          // Timestamp when added
  metadata: {               // Additional transaction details
    mode: "",               // e.g., "UPI", "Card", "Net Banking", "Cash"
    reference: "",          // Transaction reference number
    merchant: ""            // Merchant/payee name
  }
};

/**
 * Holdings Template
 * Collection: users/{userId}/holdings/{holdingId}
 */
const holdingTemplate = {
  instrumentName: "",       // Name of the instrument (stock/fund name)
  instrumentType: "",       // "MF" (Mutual Fund), "Equity", "Bond"
  category: "",             // "Stock", "Mutual Fund", "SIP", "ETF", "Index Fund", "Debt Fund"
  quantity: 0,              // Number of units held
  averageBuyPrice: 0,       // Average purchase price per unit
  currentPrice: 0,          // Current market price per unit
  symbol: "",               // Trading symbol (e.g., "RELIANCE", "TCS")
  isin: "",                 // ISIN code for the instrument
  investedValue: 0,         // Total invested amount (quantity * averageBuyPrice)
  currentValue: 0,          // Current market value (quantity * currentPrice)
  profitLoss: 0,            // Unrealized P&L
  profitLossPercentage: 0,  // P&L percentage
  purchaseDate: null,       // First purchase date (Firestore Timestamp)
  createdAt: null,          // Timestamp when added
  updatedAt: null           // Timestamp when last updated
};

/**
 * Validation functions for each template
 */
const validators = {
  /**
   * Validate bank account data
   */
  validateBankAccount(data) {
    const errors = [];
    
    if (!data.accountType) errors.push("Account type is required");
    if (!data.accountNumberMasked) errors.push("Account number is required");
    if (typeof data.currentBalance !== 'number') errors.push("Current balance must be a number");
    if (!data.currency) errors.push("Currency is required");
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate transaction data
   */
  validateTransaction(data) {
    const errors = [];
    
    if (!data.date) errors.push("Transaction date is required");
    if (typeof data.amount !== 'number' || data.amount === 0) errors.push("Valid amount is required");
    if (!['debit', 'credit'].includes(data.type)) errors.push("Type must be 'debit' or 'credit'");
    if (!data.description) errors.push("Description is required");
    if (!data.category) errors.push("Category is required");
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate holdings data
   */
  validateHolding(data) {
    const errors = [];
    
    if (!data.instrumentName) errors.push("Instrument name is required");
    if (!['MF', 'Equity', 'Bond'].includes(data.instrumentType)) {
      errors.push("Instrument type must be 'MF', 'Equity', or 'Bond'");
    }
    const validCategories = ['Stock', 'Mutual Fund', 'SIP', 'ETF', 'Index Fund', 'Debt Fund', 'Equity', 'Bond'];
    if (data.category && !validCategories.includes(data.category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }
    if (typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.push("Quantity must be a positive number");
    }
    if (typeof data.averageBuyPrice !== 'number' || data.averageBuyPrice <= 0) {
      errors.push("Average buy price must be a positive number");
    }
    if (typeof data.currentPrice !== 'number' || data.currentPrice < 0) {
      errors.push("Current price must be a non-negative number");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Helper functions to create new instances with defaults
 */
const createBankAccount = (data) => {
  const now = new Date();
  return {
    ...bankAccountTemplate,
    ...data,
    createdAt: now,
    updatedAt: now
  };
};

const createTransaction = (data) => {
  return {
    ...transactionTemplate,
    ...data,
    createdAt: new Date(),
    metadata: {
      ...transactionTemplate.metadata,
      ...(data.metadata || {})
    }
  };
};

const createHolding = (data) => {
  const now = new Date();
  const holding = {
    ...holdingTemplate,
    ...data,
    category: data.category || (data.instrumentType === 'Equity' ? 'Stock' : data.instrumentType === 'MF' ? 'Mutual Fund' : 'Investment'),
    createdAt: now,
    updatedAt: now
  };
  
  // Calculate derived fields
  holding.investedValue = holding.quantity * holding.averageBuyPrice;
  holding.currentValue = holding.quantity * holding.currentPrice;
  holding.profitLoss = holding.currentValue - holding.investedValue;
  holding.profitLossPercentage = holding.investedValue > 0 
    ? ((holding.profitLoss / holding.investedValue) * 100).toFixed(2)
    : 0;
  
  return holding;
};

export {
  bankAccountTemplate,
  transactionTemplate,
  holdingTemplate,
  validators,
  createBankAccount,
  createTransaction,
  createHolding
};
