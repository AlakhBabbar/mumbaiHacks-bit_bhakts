import express from 'express';
import chatAgent from '../agents/chatAgent.js';

const router = express.Router();

/**
 * POST /api/chat
 * Handle chat messages with AI agent
 */
router.post('/', async (req, res) => {
  try {
    const { userId, message, history } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }

    // Get AI response
    const result = await chatAgent.chat(userId, message.trim());

    if (result.success) {
      return res.json({
        success: true,
        response: result.response,
        timestamp: result.timestamp
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate response',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      message: error.message
    });
  }
});

/**
 * GET /api/chat/history?userId={userId}
 * Get conversation history for a user
 */
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const history = await chatAgent.loadConversationHistory(userId);

    return res.json({
      success: true,
      data: history,
      count: history.length
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history',
      message: error.message
    });
  }
});

/**
 * DELETE /api/chat/history?userId={userId}
 * Clear conversation history for a user
 */
router.delete('/history', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await chatAgent.clearHistory(userId);

    return res.json(result);

  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear chat history',
      message: error.message
    });
  }
});

export default router;
