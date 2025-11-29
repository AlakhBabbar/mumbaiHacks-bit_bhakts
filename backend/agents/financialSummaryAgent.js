import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import firestoreService from "../services/firestoreService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function ensureKey() {
  const key = process.env.GEMINI_API;
  if (!key || key.trim() === "") {
    throw new Error("GEMINI_API missing in backend/.env");
  }
  return key;
}

// Tool to fetch financial data from Firestore
const getFinancialDataTool = tool(
  async ({ userId }) => {
    try {
      // Fetch all financial data
      const [bankAccounts, transactions, holdings] = await Promise.all([
        firestoreService.getBankAccounts(userId),
        firestoreService.getTransactions(userId, { limit: 50 }),
        firestoreService.getHoldings(userId)
      ]);

      // Calculate totals
      const totalBalance = bankAccounts.data?.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0) || 0;
      
      const totalInvested = holdings.data?.reduce((sum, h) => sum + (h.quantity * h.averageBuyPrice), 0) || 0;
      const totalCurrentValue = holdings.data?.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0) || 0;
      const totalPnL = totalCurrentValue - totalInvested;
      
      // Calculate spending by category
      const spendingByCategory = {};
      const incomeByCategory = {};
      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.data?.forEach(txn => {
        if (txn.type === 'debit') {
          totalExpenses += txn.amount;
          spendingByCategory[txn.category] = (spendingByCategory[txn.category] || 0) + txn.amount;
        } else if (txn.type === 'credit') {
          totalIncome += txn.amount;
          incomeByCategory[txn.category] = (incomeByCategory[txn.category] || 0) + txn.amount;
        }
      });

      // Get top spending category
      const topSpendCategory = Object.entries(spendingByCategory)
        .sort((a, b) => b[1] - a[1])[0];

      // Categorize holdings
      const stocks = holdings.data?.filter(h => h.category === 'Stock' || h.instrumentType === 'Equity') || [];
      const mutualFunds = holdings.data?.filter(h => h.category === 'Mutual Fund' || h.instrumentType === 'MF') || [];
      const sips = holdings.data?.filter(h => h.category === 'SIP') || [];

      return JSON.stringify({
        bankAccounts: {
          count: bankAccounts.data?.length || 0,
          totalBalance,
          accounts: bankAccounts.data?.map(acc => ({
            bankName: acc.bankName,
            accountType: acc.accountType,
            balance: acc.currentBalance
          })) || []
        },
        investments: {
          totalInvested,
          currentValue: totalCurrentValue,
          profitLoss: totalPnL,
          profitLossPercentage: totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0,
          stocks: {
            count: stocks.length,
            value: stocks.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0)
          },
          mutualFunds: {
            count: mutualFunds.length,
            value: mutualFunds.reduce((sum, m) => sum + (m.quantity * m.currentPrice), 0)
          },
          sips: {
            count: sips.length,
            value: sips.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0)
          }
        },
        cashflow: {
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2) : 0,
          topSpendingCategory: topSpendCategory ? { category: topSpendCategory[0], amount: topSpendCategory[1] } : null,
          spendingByCategory
        },
        transactions: {
          total: transactions.data?.length || 0,
          recentCount: Math.min(10, transactions.data?.length || 0)
        }
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return JSON.stringify({ error: 'Failed to fetch financial data', message: error.message });
    }
  },
  {
    name: "getFinancialData",
    description: "Fetches comprehensive financial data for a user including bank accounts, investments, transactions, and cashflow analysis from Firestore",
    schema: z.object({
      userId: z.string().describe("The user ID to fetch financial data for")
    })
  }
);

export async function generateFinancialSummary(userId) {
  const key = ensureKey();
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: key,
    temperature: 0.3,
  }).bindTools([getFinancialDataTool]);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a professional financial advisor AI. Your job is to:
1. First, use the getFinancialData tool to fetch the user's complete financial data
2. Analyze their financial situation comprehensively
3. Generate a brief, insightful summary (2-3 sentences) about their overall financial health
4. Highlight key positives and areas for improvement
5. Keep it encouraging but realistic

The summary should be concise, actionable, and easy to understand. Focus on:
- Overall financial health
- Key strengths (good savings rate, diversified investments, etc.)
- Main concerns (high spending in certain categories, low emergency fund, etc.)
- One simple recommendation

Return ONLY a plain text summary, no JSON, no formatting, just 2-3 clear sentences.`
    ],
    [
      "human",
      `Generate a financial summary for user: {userId}

Use the getFinancialData tool to fetch their data first, then provide your analysis.`
    ],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  
  try {
    const summary = await chain.invoke({ userId });
    return {
      success: true,
      summary: summary.trim(),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return {
      success: false,
      error: error.message,
      summary: 'Unable to generate financial summary at this time.'
    };
  }
}

// Test execution
if (process.argv[1] && process.argv[1].endsWith("financialSummaryAgent.js")) {
  const testUserId = process.argv[2] || "test-user-id";
  
  generateFinancialSummary(testUserId)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Financial summary agent error:", err?.message || err);
      process.exit(1);
    });
}
