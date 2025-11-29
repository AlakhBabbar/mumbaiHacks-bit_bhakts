import { db } from '../firebase/firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit as limitQuery } from 'firebase/firestore';
import { 
  createBankAccount, 
  createTransaction, 
  createHolding,
  validators 
} from '../models/financialDataTemplates.js';

/**
 * Firestore Service for saving financial data to user subcollections
 */
class FirestoreFinancialService {
  
  /**
   * Save bank account to users/{userId}/bankAccounts
   */
  async saveBankAccount(userId, accountData) {
    try {
      // Validate the data
      const validation = validators.validateBankAccount(accountData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create bank account with defaults
      const bankAccount = createBankAccount(accountData);
      
      // Save to Firestore
      const bankAccountsRef = collection(db, 'users', userId, 'bankAccounts');
      const docRef = await addDoc(bankAccountsRef, bankAccount);

      return {
        success: true,
        id: docRef.id,
        data: bankAccount
      };
    } catch (error) {
      console.error('Error saving bank account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save multiple bank accounts
   */
  async saveBankAccounts(userId, accountsData) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
      savedIds: []
    };

    for (const accountData of accountsData) {
      const result = await this.saveBankAccount(userId, accountData);
      if (result.success) {
        results.success++;
        results.savedIds.push(result.id);
      } else {
        results.failed++;
        results.errors.push(result.error);
      }
    }

    return results;
  }

  /**
   * Save transaction to users/{userId}/transactions
   */
  async saveTransaction(userId, transactionData) {
    try {
      // Validate the data
      const validation = validators.validateTransaction(transactionData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create transaction with defaults
      const transaction = createTransaction(transactionData);
      
      // Convert date string to Firestore Timestamp if needed
      if (typeof transaction.date === 'string') {
        transaction.date = new Date(transaction.date);
      }

      // Save to Firestore
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      const docRef = await addDoc(transactionsRef, transaction);

      return {
        success: true,
        id: docRef.id,
        data: transaction
      };
    } catch (error) {
      console.error('Error saving transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save multiple transactions in batch
   */
  async saveTransactions(userId, transactionsData) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
      savedIds: []
    };

    // Process in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    for (let i = 0; i < transactionsData.length; i += batchSize) {
      const batch = transactionsData.slice(i, i + batchSize);
      
      for (const transactionData of batch) {
        const result = await this.saveTransaction(userId, transactionData);
        if (result.success) {
          results.success++;
          results.savedIds.push(result.id);
        } else {
          results.failed++;
          results.errors.push(result.error);
        }
      }
    }

    return results;
  }

  /**
   * Save holding to users/{userId}/holdings
   */
  async saveHolding(userId, holdingData) {
    try {
      // Validate the data
      const validation = validators.validateHolding(holdingData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create holding with defaults and calculated fields
      const holding = createHolding(holdingData);
      
      // Convert purchaseDate string to Date if needed
      if (typeof holding.purchaseDate === 'string') {
        holding.purchaseDate = new Date(holding.purchaseDate);
      }

      // Save to Firestore
      const holdingsRef = collection(db, 'users', userId, 'holdings');
      const docRef = await addDoc(holdingsRef, holding);

      return {
        success: true,
        id: docRef.id,
        data: holding
      };
    } catch (error) {
      console.error('Error saving holding:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save multiple holdings
   */
  async saveHoldings(userId, holdingsData) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
      savedIds: []
    };

    for (const holdingData of holdingsData) {
      const result = await this.saveHolding(userId, holdingData);
      if (result.success) {
        results.success++;
        results.savedIds.push(result.id);
      } else {
        results.failed++;
        results.errors.push(result.error);
      }
    }

    return results;
  }

  /**
   * Save all financial data (bank accounts, transactions, holdings) at once
   */
  async saveAllFinancialData(userId, extractedData) {
    try {
      const results = {
        bankAccounts: { success: 0, failed: 0, errors: [], ids: [] },
        transactions: { success: 0, failed: 0, errors: [], ids: [] },
        holdings: { success: 0, failed: 0, errors: [], ids: [] },
        overall: { success: true, totalSaved: 0, totalFailed: 0 }
      };

      // Save bank accounts
      if (extractedData.bankAccounts && extractedData.bankAccounts.length > 0) {
        const bankResults = await this.saveBankAccounts(userId, extractedData.bankAccounts);
        results.bankAccounts = {
          success: bankResults.success,
          failed: bankResults.failed,
          errors: bankResults.errors,
          ids: bankResults.savedIds
        };
      }

      // Save transactions
      if (extractedData.transactions && extractedData.transactions.length > 0) {
        const txnResults = await this.saveTransactions(userId, extractedData.transactions);
        results.transactions = {
          success: txnResults.success,
          failed: txnResults.failed,
          errors: txnResults.errors,
          ids: txnResults.savedIds
        };
      }

      // Save holdings
      if (extractedData.holdings && extractedData.holdings.length > 0) {
        const holdingResults = await this.saveHoldings(userId, extractedData.holdings);
        results.holdings = {
          success: holdingResults.success,
          failed: holdingResults.failed,
          errors: holdingResults.errors,
          ids: holdingResults.savedIds
        };
      }

      // Calculate overall stats
      results.overall.totalSaved = 
        results.bankAccounts.success + 
        results.transactions.success + 
        results.holdings.success;
      
      results.overall.totalFailed = 
        results.bankAccounts.failed + 
        results.transactions.failed + 
        results.holdings.failed;

      results.overall.success = results.overall.totalFailed === 0;

      return results;
    } catch (error) {
      console.error('Error saving financial data:', error);
      return {
        overall: { success: false, error: error.message },
        bankAccounts: { success: 0, failed: 0, errors: [], ids: [] },
        transactions: { success: 0, failed: 0, errors: [], ids: [] },
        holdings: { success: 0, failed: 0, errors: [], ids: [] }
      };
    }
  }

  /**
   * Get all bank accounts for a user
   */
  async getBankAccounts(userId) {
    try {
      const bankAccountsRef = collection(db, 'users', userId, 'bankAccounts');
      const snapshot = await getDocs(bankAccountsRef);

      const accounts = [];
      snapshot.forEach(doc => {
        accounts.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: accounts };
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get transactions for a user with optional filters
   */
  async getTransactions(userId, filters = {}) {
    try {
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      const constraints = [];

      // Apply filters
      if (filters.startDate) {
        constraints.push(where('date', '>=', new Date(filters.startDate)));
      }
      if (filters.endDate) {
        constraints.push(where('date', '<=', new Date(filters.endDate)));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      // Order by date descending
      constraints.push(orderBy('date', 'desc'));

      // Limit results if specified
      if (filters.limit) {
        constraints.push(limitQuery(filters.limit));
      }

      const q = query(transactionsRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const transactions = [];
      snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: transactions };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get all holdings for a user
   */
  async getHoldings(userId, category = null) {
    try {
      const holdingsRef = collection(db, 'users', userId, 'holdings');
      let q;

      if (category) {
        // Filter by category if provided
        q = query(holdingsRef, where('category', '==', category));
      } else {
        q = holdingsRef;
      }

      const snapshot = await getDocs(q);

      const holdings = [];
      snapshot.forEach(doc => {
        holdings.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: holdings };
    } catch (error) {
      console.error('Error fetching holdings:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

export default new FirestoreFinancialService();
