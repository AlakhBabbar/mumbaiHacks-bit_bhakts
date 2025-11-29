import express from 'express';
import multer from 'multer';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import fs from 'fs/promises';
import geminiExtractor from '../services/geminiExtractor.js';
import firestoreService from '../services/firestoreService.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'financial-doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * POST /api/financial/upload-pdf
 * Upload and process a financial document (bank statement, portfolio report, etc.)
 */
router.post('/upload-pdf', upload.single('document'), async (req, res) => {
  let filePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF document.'
      });
    }

    // Get userId from request (assuming it's passed via authentication middleware)
    const userId = req.body.userId || req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    filePath = req.file.path;
    console.log(`Processing PDF: ${req.file.originalname} for user: ${userId}`);

    // Step 1: Extract text from PDF
    console.log('Step 1: Extracting text from PDF...');
    const dataBuffer = await fs.readFile(filePath);
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
    });
    const pdfDocument = await loadingTask.promise;
    
    // Extract text from all pages
    let pdfText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      pdfText += pageText + '\n';
    }

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error('PDF appears to be empty or contains insufficient text');
    }

    console.log(`Extracted ${pdfText.length} characters from PDF`);

    // Step 2: Extract structured data using Gemini AI
    console.log('Step 2: Extracting structured data using Gemini AI...');
    const extractionResult = await geminiExtractor.extractWithRetry(pdfText);

    if (!extractionResult.success) {
      return res.status(500).json({
        success: false,
        error: extractionResult.error.details,
        stage: 'ai_extraction'
      });
    }

    const extractedData = extractionResult.data;
    console.log('Extraction metadata:', extractionResult.metadata);
    console.log('Extracted data:', JSON.stringify(extractedData, null, 2));

    // Step 3: Validate extracted data
    console.log('Step 3: Validating extracted data...');
    const validation = geminiExtractor.validateExtractedData(extractedData);
    
    if (!validation.isValid) {
      return res.status(422).json({
        success: false,
        error: 'Extracted data validation failed',
        validationErrors: validation.errors,
        warnings: validation.warnings,
        stage: 'validation'
      });
    }

    // Step 4: Save to Firestore
    console.log('Step 4: Saving data to Firestore...');
    const saveResults = await firestoreService.saveAllFinancialData(userId, extractedData);

    // Step 5: Cleanup - delete uploaded file
    try {
      await fs.unlink(filePath);
      console.log('Temporary file cleaned up');
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }

    // Step 6: Return success response
    const response = {
      success: true,
      message: 'Financial document processed successfully',
      extraction: extractionResult.metadata,
      validation: {
        warnings: validation.warnings
      },
      saved: {
        bankAccounts: {
          total: extractedData.bankAccounts.length,
          saved: saveResults.bankAccounts.success,
          failed: saveResults.bankAccounts.failed,
          ids: saveResults.bankAccounts.ids
        },
        transactions: {
          total: extractedData.transactions.length,
          saved: saveResults.transactions.success,
          failed: saveResults.transactions.failed
        },
        holdings: {
          total: extractedData.holdings.length,
          saved: saveResults.holdings.success,
          failed: saveResults.holdings.failed,
          ids: saveResults.holdings.ids
        },
        overall: {
          totalSaved: saveResults.overall.totalSaved,
          totalFailed: saveResults.overall.totalFailed
        }
      }
    };

    // Include errors if any
    if (saveResults.overall.totalFailed > 0) {
      response.saved.errors = {
        bankAccounts: saveResults.bankAccounts.errors,
        transactions: saveResults.transactions.errors,
        holdings: saveResults.holdings.errors
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error processing PDF:', error);

    // Cleanup file if it exists
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process financial document',
      stage: 'processing'
    });
  }
});

/**
 * GET /api/financial/bank-accounts
 * Get all bank accounts for authenticated user
 */
router.get('/bank-accounts', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const result = await firestoreService.getBankAccounts(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/financial/transactions
 * Get transactions for authenticated user with optional filters
 */
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type,
      category: req.query.category,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const result = await firestoreService.getTransactions(userId, filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/financial/holdings
 * Get all holdings for authenticated user
 */
router.get('/holdings', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const result = await firestoreService.getHoldings(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/financial/summary
 * Get summary of all financial data for authenticated user
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const [bankAccounts, transactions, holdings] = await Promise.all([
      firestoreService.getBankAccounts(userId),
      firestoreService.getTransactions(userId, { limit: 10 }),
      firestoreService.getHoldings(userId)
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        bankAccountsCount: bankAccounts.data?.length || 0,
        transactionsCount: transactions.data?.length || 0,
        holdingsCount: holdings.data?.length || 0,
        recentTransactions: transactions.data?.slice(0, 5) || []
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
