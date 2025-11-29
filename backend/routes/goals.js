import express from 'express';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

const router = express.Router();

/**
 * GET /api/goals?userId={userId}
 * Fetch all goals for a user
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Query goals from Firestore
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const goals = [];
    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.json({
      success: true,
      data: goals,
      count: goals.length
    });

  } catch (error) {
    console.error('Error fetching goals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
      message: error.message
    });
  }
});

/**
 * POST /api/goals
 * Create a new goal
 */
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, targetAmount, currentAmount, targetDate, category } = req.body;

    // Validation
    if (!userId || !title || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: 'userId, title, and targetAmount are required'
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'targetAmount must be greater than 0'
      });
    }

    // Create goal object
    const goalData = {
      title,
      description: description || '',
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || null,
      category: category || 'General',
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Save to Firestore
    const goalsRef = collection(db, 'users', userId, 'goals');
    const docRef = await addDoc(goalsRef, goalData);

    return res.json({
      success: true,
      data: {
        id: docRef.id,
        ...goalData
      },
      message: 'Goal created successfully'
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create goal',
      message: error.message
    });
  }
});

export default router;
