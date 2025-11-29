import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { createGoalForUser } from '../goalAgent.js';

/**
 * Tool to create financial goals based on user's data and context
 */
export function getGoalCreatorTool() {
  return new DynamicStructuredTool({
    name: 'createFinancialGoal',
    description: 'Creates a personalized financial goal for the user based on their financial data and conversation context. Use this when the user asks to create a goal, make a new goal, set a financial target, or wants help with goal planning.',
    schema: z.object({
      userId: z.string().describe('The user ID'),
      context: z.string().describe('Conversation context or specific goal request from user')
    }),
    func: async ({ userId, context }) => {
      try {
        const result = await createGoalForUser(userId, context);
        
        if (result.success) {
          return JSON.stringify({
            success: true,
            message: result.message,
            goalId: result.goalId,
            goalTitle: result.goal.title,
            targetAmount: result.goal.targetAmount,
            targetDate: result.goal.targetDate,
            category: result.goal.category
          });
        } else {
          return JSON.stringify({
            success: false,
            message: result.message
          });
        }
      } catch (error) {
        console.error('Error in goal creator tool:', error);
        return JSON.stringify({
          success: false,
          message: 'Failed to create goal. Please try again.'
        });
      }
    }
  });
}
