import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { getFinancialDataTool } from './tools/financialDataTool.js';
import { getGoalCreatorTool } from './tools/goalCreatorTool.js';

/**
 * Chat Agent with conversation memory and financial data access
 */
class ChatAgent {
  constructor() {
    // Initialize Gemini model
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
  }

  /**
   * Load conversation history from Firestore
   **/
  async loadConversationHistory(userId) {
    try {
      const conversationsRef = collection(db, 'users', userId, 'chatHistory');
      const q = query(
        conversationsRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const messages = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          role: data.role,
          content: data.message,
          timestamp: data.timestamp
        });
      });

      // Return in chronological order
      return messages.reverse();
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  /**
   * Save message to Firestore
   */
  async saveMessage(userId, role, message) {
    try {
      const conversationsRef = collection(db, 'users', userId, 'chatHistory');
      await addDoc(conversationsRef, {
        role,
        message,
        timestamp: Timestamp.now(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Get financial context for the user
   */
  async getFinancialContext(userId) {
    try {
      const tool = getFinancialDataTool();
      const result = await tool._call({ userId });
      return result;
    } catch (error) {
      console.error('Error fetching financial context:', error);
      return null;
    }
  }

  /**
   * Generate AI response with context and memory
   */
  async chat(userId, userMessage) {
    try {
      console.log('Chat agent called for user:', userId);
      console.log('User message:', userMessage);
      
      // Load recent conversation history
      const history = await this.loadConversationHistory(userId);
      console.log('Loaded history, message count:', history.length);
      
      // Get financial context
      const financialContext = await this.getFinancialContext(userId);
      console.log('Financial context fetched:', financialContext ? 'Yes' : 'No');

      // Build conversation history text
      const historyText = history.length > 0 
        ? history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
        : 'No previous conversation.';

      // Check if user wants to create a goal
      const goalKeywords = ['create goal', 'make goal', 'new goal', 'set goal', 'goal for me', 'financial goal', 'help me with goal'];
      const wantsToCreateGoal = goalKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

      if (wantsToCreateGoal) {
        console.log('User wants to create a goal, invoking goal creator tool...');
        
        // Use the goal creator tool
        const goalCreatorTool = getGoalCreatorTool();
        const toolResult = await goalCreatorTool._call({
          userId,
          context: `${historyText}\n\nUser's latest message: ${userMessage}`
        });
        
        const goalResponse = JSON.parse(toolResult);
        
        if (goalResponse.success) {
          const responseMessage = `${goalResponse.message}\n\nGoal Details:\n- Title: ${goalResponse.goalTitle}\n- Target: ₹${goalResponse.targetAmount.toLocaleString('en-IN')}\n- Deadline: ${goalResponse.targetDate}\n- Category: ${goalResponse.category}`;
          
          // Save both messages to Firestore
          await Promise.all([
            this.saveMessage(userId, 'user', userMessage),
            this.saveMessage(userId, 'assistant', responseMessage)
          ]);
          
          return {
            success: true,
            response: responseMessage,
            timestamp: new Date().toISOString(),
            goalCreated: true,
            goalId: goalResponse.goalId
          };
        } else {
          // Tool failed, fall back to regular response
          console.log('Goal creation failed, falling back to regular chat');
        }
      }

      // Regular chat response (no goal creation)
      // Build context-aware prompt
      const systemPrompt = `You are a helpful financial AI assistant. You have access to the user's financial data and conversation history.

FINANCIAL CONTEXT:
${financialContext || 'No financial data available yet. Encourage user to upload their financial documents.'}

CAPABILITIES:
- Analyze spending patterns and provide insights
- Help with financial goal planning (suggest creating goals if user mentions wanting to save or invest)
- Answer questions about investments, stocks, mutual funds, and SIPs
- Provide personalized financial advice based on user's data
- Explain financial concepts and strategies

GUIDELINES:
- Be conversational, friendly, and professional
- Use the user's actual financial data when answering questions
- Provide specific, actionable advice
- If you don't have enough information, ask clarifying questions
- Use rupee symbol for currency amounts
- Keep responses concise but informative (2-4 sentences typically)
- If user wants to create a goal, tell them to say "create a goal for me" or "make a new goal"

PREVIOUS CONVERSATION:
${historyText}

Now respond to the user's latest message.`;

      // Use direct model invocation
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage)
      ];

      // Get response
      const response = await this.model.invoke(messages);

      const assistantMessage = response.content;

      // Save both messages to Firestore
      await Promise.all([
        this.saveMessage(userId, 'user', userMessage),
        this.saveMessage(userId, 'assistant', assistantMessage)
      ]);

      return {
        success: true,
        response: assistantMessage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in chat agent:', error);
      return {
        success: false,
        response: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error.message
      };
    }
  }

  /**
   * Clear conversation memory for a user
   */
  async clearHistory(userId) {
    try {
      // Clear Firestore history
      const conversationsRef = collection(db, 'users', userId, 'chatHistory');
      const snapshot = await getDocs(conversationsRef);
      
      const deletePromises = [];
      snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing history:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new ChatAgent();
