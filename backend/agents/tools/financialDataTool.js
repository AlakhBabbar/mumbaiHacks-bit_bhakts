import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';

/**
 * Tool to fetch user's financial data from Firestore
 */
export const getFinancialDataTool = () => {
  return new DynamicStructuredTool({
    name: 'get_financial_data',
    description: 'Fetches comprehensive financial data for a user including bank accounts, transactions, holdings (stocks, mutual funds, SIPs), and goals. Use this to analyze spending patterns, investment portfolio, and financial goals.',
    schema: z.object({
      userId: z.string().describe('The Firebase user ID'),
    }),
    func: async ({ userId }) => {
      try {
        // Fetch bank accounts
        const bankAccountsRef = collection(db, 'users', userId, 'bankAccounts');
        const bankAccountsSnapshot = await getDocs(bankAccountsRef);
        const bankAccounts = [];
        bankAccountsSnapshot.forEach(doc => {
          bankAccounts.push({ id: doc.id, ...doc.data() });
        });

        // Fetch recent transactions
        const transactionsRef = collection(db, 'users', userId, 'transactions');
        const transactionsQuery = query(
          transactionsRef,
          orderBy('date', 'desc'),
          limit(50)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactions = [];
        transactionsSnapshot.forEach(doc => {
          const data = doc.data();
          transactions.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
          });
        });

        // Fetch holdings (stocks, mutual funds, SIPs)
        const holdingsRef = collection(db, 'users', userId, 'holdings');
        const holdingsSnapshot = await getDocs(holdingsRef);
        const holdings = [];
        holdingsSnapshot.forEach(doc => {
          holdings.push({ id: doc.id, ...doc.data() });
        });

        // Fetch goals
        const goalsRef = collection(db, 'users', userId, 'goals');
        const goalsQuery = query(goalsRef, orderBy('createdAt', 'desc'));
        const goalsSnapshot = await getDocs(goalsQuery);
        const goals = [];
        goalsSnapshot.forEach(doc => {
          const data = doc.data();
          goals.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
          });
        });

        // Calculate analytics
        const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
        const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.averageBuyPrice || 0), 0);
        const totalCurrent = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice || 0), 0);
        const totalPnL = totalCurrent - totalInvested;

        // Categorize holdings
        const stocks = holdings.filter(h => h.category === 'Stock');
        const mutualFunds = holdings.filter(h => h.category === 'Mutual Fund');
        const sips = holdings.filter(h => h.category === 'SIP');

        // Spending by category
        const spendingByCategory = {};
        const incomeByCategory = {};
        
        transactions.forEach(txn => {
          if (txn.type === 'debit') {
            spendingByCategory[txn.category] = (spendingByCategory[txn.category] || 0) + txn.amount;
          } else if (txn.type === 'credit') {
            incomeByCategory[txn.category] = (incomeByCategory[txn.category] || 0) + txn.amount;
          }
        });

        const totalSpent = Object.values(spendingByCategory).reduce((sum, val) => sum + val, 0);
        const totalIncome = Object.values(incomeByCategory).reduce((sum, val) => sum + val, 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome * 100).toFixed(1) : 0;

        // Format response
        const summary = {
          overview: {
            totalBankBalance: totalBalance,
            totalInvested: totalInvested,
            currentPortfolioValue: totalCurrent,
            totalPnL: totalPnL,
            pnlPercentage: totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0,
            savingsRate: savingsRate
          },
          accounts: {
            bankAccountsCount: bankAccounts.length,
            accounts: bankAccounts.map(acc => ({
              type: acc.accountType,
              balance: acc.currentBalance,
              masked: acc.accountNumberMasked
            }))
          },
          transactions: {
            total: transactions.length,
            totalSpent: totalSpent,
            totalIncome: totalIncome,
            recentTransactions: transactions.slice(0, 10).map(txn => ({
              date: txn.date,
              type: txn.type,
              amount: txn.amount,
              category: txn.category,
              description: txn.description
            })),
            spendingByCategory: Object.entries(spendingByCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, amount]) => ({ category, amount }))
          },
          portfolio: {
            totalHoldings: holdings.length,
            stocks: {
              count: stocks.length,
              totalValue: stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice || 0), 0)
            },
            mutualFunds: {
              count: mutualFunds.length,
              totalValue: mutualFunds.reduce((sum, mf) => sum + (mf.quantity * mf.currentPrice || 0), 0)
            },
            sips: {
              count: sips.length,
              totalValue: sips.reduce((sum, sip) => sum + (sip.quantity * sip.currentPrice || 0), 0)
            }
          },
          goals: {
            total: goals.length,
            active: goals.filter(g => g.status === 'active').length,
            goalsData: goals.map(g => ({
              title: g.title,
              category: g.category,
              targetAmount: g.targetAmount,
              currentAmount: g.currentAmount,
              progress: ((g.currentAmount / g.targetAmount) * 100).toFixed(1)
            }))
          }
        };

        return JSON.stringify(summary, null, 2);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        return JSON.stringify({ error: 'Failed to fetch financial data', message: error.message });
      }
    }
  });
};
