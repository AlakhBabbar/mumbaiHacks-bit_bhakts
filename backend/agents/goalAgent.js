import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { getFinancialDataTool } from './tools/financialDataTool.js';

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

/**
 * Create financial goals based on user's financial data and conversation context
 */
export async function createGoalForUser(userId, conversationContext = '') {
  try {
    const key = ensureKey();
    
    // Fetch user's financial data
    const tool = getFinancialDataTool();
    const financialData = await tool._call({ userId });
    
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: key,
      temperature: 0.3,
    });

    const systemPrompt = `You are an intelligent financial goal creator. Based on the user's financial data and conversation context, create ONE realistic, achievable financial goal.

FINANCIAL DATA:
${financialData}

CONVERSATION CONTEXT:
${conversationContext || 'User requested to create a new financial goal.'}

YOUR TASK:
Analyze the user's financial situation and create ONE specific, measurable, achievable, relevant, and time-bound (SMART) goal.

Consider:
1. Their current savings and investment patterns
2. Their spending habits and areas for improvement
3. Their existing portfolio and diversification
4. Any goals they mentioned in the conversation
5. Realistic timeframes based on their financial capacity

Return ONLY a JSON object with this EXACT structure (no markdown, no code blocks):
{
  "title": "Brief goal title (max 50 chars)",
  "description": "Detailed description of the goal and why it matters (2-3 sentences)",
  "targetAmount": 50000,
  "currentAmount": 0,
  "targetDate": "2026-06-30",
  "category": "Savings|Investment|Debt Reduction|Emergency Fund|Retirement|Education|Real Estate|Other",
  "priority": "High|Medium|Low",
  "actionSteps": ["Step 1", "Step 2", "Step 3"]
}

IMPORTANT:
- targetAmount should be a realistic number based on their income/savings
- targetDate should be 3-12 months from now
- currentAmount is typically 0 for new goals (unless it's an ongoing goal)
- actionSteps should be 3-5 specific, actionable steps
- Choose the most appropriate category
- Make it encouraging and achievable`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage('Create a personalized financial goal for me based on my data.')
    ];

    console.log('Creating goal for user:', userId);
    const response = await model.invoke(messages);
    let goalData;

    try {
      // Clean the response - remove markdown code blocks if present
      let cleanResponse = response.content.trim();
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      goalData = JSON.parse(cleanResponse);
      console.log('Parsed goal data:', goalData);
    } catch (parseError) {
      console.error('Failed to parse goal JSON:', parseError);
      console.error('Raw response:', response.content);
      throw new Error('Failed to generate valid goal structure');
    }

    // Validate required fields
    if (!goalData.title || !goalData.targetAmount || !goalData.targetDate || !goalData.category) {
      throw new Error('Generated goal is missing required fields');
    }

    // Save to Firestore
    const goalsRef = collection(db, 'users', userId, 'goals');
    const goalToSave = {
      title: goalData.title,
      description: goalData.description || '',
      targetAmount: Number(goalData.targetAmount),
      currentAmount: Number(goalData.currentAmount) || 0,
      targetDate: goalData.targetDate,
      category: goalData.category,
      priority: goalData.priority || 'Medium',
      actionSteps: goalData.actionSteps || [],
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'ai-agent'
    };

    const docRef = await addDoc(goalsRef, goalToSave);
    console.log('Goal saved with ID:', docRef.id);

    return {
      success: true,
      goalId: docRef.id,
      goal: goalToSave,
      message: `Great! I've created a new goal for you: "${goalData.title}". You can track it on your Goals page.`
    };

  } catch (error) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      error: error.message,
      message: 'I had trouble creating a goal. Please try again or create one manually on the Goals page.'
    };
  }
}

if (process.argv[1] && process.argv[1].endsWith("goalAgent.js")) {
  createGoals({
    focusArea: "Improve saving + investing habits",
    timeframe: "8 weeks",
    startingPoint: "Intermediate",
    constraints: ["busy weekdays", "limited capital"],
    preferences: { tools: ["Google Sheets", "NSE data"], style: "brief" },
  })
    .then((out) => {
      console.log(JSON.stringify(out, null, 2));
    })
    .catch((err) => {
      console.error("Goal agent error:", err?.message || err);
      process.exit(1);
    });
}
