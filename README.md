# FinWise AI - Intelligent Financial Management Platform

An AI-powered financial management application that helps users track their finances, manage investments, set goals, and receive personalized financial advice through an intelligent chatbot.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [AI Agents](#ai-agents)
- [API Documentation](#api-documentation)
- [Authors](#authors)

## Overview

FinWise AI is a comprehensive financial management solution that combines traditional portfolio tracking with advanced AI capabilities. Users can upload financial documents (PDFs), view their portfolio performance, track spending patterns, set financial goals, and interact with an AI assistant for personalized financial advice.

## Features

### Core Features
- **PDF Document Processing**: Upload bank statements and investment documents for automatic data extraction
- **Portfolio Management**: Track stocks, mutual funds, SIPs, and ETFs in real-time
- **Transaction Tracking**: Monitor income and expenses with automatic categorization
- **Financial Goals**: Set and track progress towards savings, investment, and debt reduction goals
- **AI Chatbot**: Conversational AI assistant for financial queries and advice
- **Financial Summaries**: AI-generated insights about spending patterns and portfolio health

### AI-Powered Features
- **Automated Data Extraction**: Gemini AI extracts structured data from uploaded PDFs
- **Intelligent Goal Creation**: AI analyzes your financial data to suggest personalized goals
- **Contextual Advice**: Chat agent provides advice based on your actual financial situation
- **Financial Analysis**: Automatic generation of insights and recommendations

## Technology Stack

### Frontend
- **[React](https://react.dev/)** (v19.2.0) - UI framework
- **[Vite](https://vitejs.dev/)** (v7.2.4) - Build tool and dev server
- **[TailwindCSS](https://tailwindcss.com/)** (v4.1.17) - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Firebase](https://firebase.google.com/)** - Authentication and Firestore client SDK

### Backend
- **[Node.js](https://nodejs.org/)** (v20.19.5) - Runtime environment
- **[Express.js](https://expressjs.com/)** (v5.1.0) - Web framework
- **[Firebase Admin](https://firebase.google.com/docs/admin/setup)** - Firestore database
- **[PDF.js](https://mozilla.github.io/pdf.js/)** (pdfjs-dist) - PDF text extraction
- **[Multer](https://github.com/expressjs/multer)** - File upload handling

### AI & Machine Learning
- **[Google Gemini AI](https://ai.google.dev/)** (gemini-2.0-flash-exp) - Language model for chat and analysis
- **[LangChain](https://js.langchain.com/)** - AI orchestration framework
  - `@langchain/google-genai` - Gemini integration
  - `@langchain/core` - Core LangChain primitives
- **[Zod](https://zod.dev/)** - Schema validation for AI tools

## Project Structure

```
Finance-management-app/
├── backend/                      # Node.js backend server
│   ├── agents/                   # AI agent implementations
│   │   ├── chatAgent.js         # Main conversational AI agent
│   │   ├── financialSummaryAgent.js  # Generates financial insights
│   │   ├── goalAgent.js         # Creates personalized financial goals
│   │   ├── stockAgent.js        # Stock market analysis
│   │   └── tools/               # LangChain tools
│   │       ├── financialDataTool.js    # Fetches user financial data
│   │       └── goalCreatorTool.js      # Goal creation tool
│   ├── firebase/                # Firebase configuration
│   │   ├── firebase.js          # Firebase initialization
│   │   └── firebase-service-account.json
│   ├── models/                  # Data models and templates
│   │   └── financialDataTemplates.js
│   ├── routes/                  # API route handlers
│   │   ├── chat.js             # Chat endpoints
│   │   ├── financialData.js    # Financial data CRUD
│   │   ├── goals.js            # Goals management
│   │   └── stockTrend.js       # Stock market data
│   ├── services/                # Business logic services
│   │   ├── firestoreService.js # Firestore database operations
│   │   └── geminiExtractor.js  # PDF data extraction with AI
│   └── index.js                 # Express server entry point
│
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatBot.jsx    # Floating AI chat interface
│   │   │   ├── FinancialDataUpload.jsx  # PDF upload component
│   │   │   ├── Login.jsx      # Authentication component
│   │   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   │   ├── StockPortfolioWidget.jsx
│   │   │   └── MutualFundsWidget.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── dashboardPage.jsx    # Main dashboard
│   │   │   ├── goalsPage.jsx        # Goals tracking
│   │   │   ├── financialDataPage.jsx # Data management
│   │   │   ├── landingPage.jsx      # Landing page
│   │   │   └── loginPage.jsx        # Login page
│   │   ├── firebase/          # Firebase client config
│   │   │   └── firebase.js
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # React entry point
│   └── vite.config.js         # Vite configuration
│
└── README.md                   # This file
```

### Key Directories Explained

#### [backend/agents/](backend/agents/)
Contains AI agent implementations powered by LangChain and Gemini AI:
- **chatAgent.js**: Manages conversations, loads history, and provides contextual responses
- **goalAgent.js**: Analyzes user finances and creates personalized SMART goals
- **financialSummaryAgent.js**: Generates summaries of financial health
- **tools/**: LangChain tools that agents can use to fetch data and perform actions

#### [backend/routes/](backend/routes/)
Express.js API endpoints:
- **POST /api/chat**: Send messages to AI chatbot
- **GET /api/chat/history**: Retrieve conversation history
- **POST /api/financial/upload**: Upload and process financial PDFs
- **GET /api/financial/transactions**: Fetch transaction data
- **GET /api/goals**: Retrieve user goals

#### [backend/services/](backend/services/)
Business logic layer:
- **geminiExtractor.js**: Uses Gemini AI to extract structured data from PDF text
- **firestoreService.js**: Handles all Firestore database operations

#### [client/src/components/](client/src/components/)
Reusable React components:
- **ChatBot.jsx**: Floating chat interface with message history
- **FinancialDataUpload.jsx**: Drag-and-drop PDF upload with progress tracking

#### [client/src/pages/](client/src/pages/)
Full page components for routing:
- **dashboardPage.jsx**: Overview with AI insights, portfolio, and transactions
- **goalsPage.jsx**: Goal creation, tracking, and progress visualization

## Getting Started

### Prerequisites

- Node.js v20 or higher
- npm or yarn
- Firebase project with Firestore enabled
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AlakhBabbar/temp-mumbaiHacks.git
cd Finance-management-app
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
GEMINI_API=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

3. **Frontend Setup**
```bash
cd ../client
npm install
```

Create a `.env` file in the client directory with the same Firebase credentials.

4. **Start Development Servers**

Backend:
```bash
cd backend
nodemon index.js
```

Frontend:
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (backend).

## AI Agents

### Chat Agent
**Location**: [backend/agents/chatAgent.js](backend/agents/chatAgent.js)

The main conversational AI that:
- Maintains conversation history in Firestore
- Fetches user's financial context for personalized responses
- Detects intent to create goals and triggers the goal creator
- Provides financial advice based on actual user data

**Key Methods**:
- `chat(userId, userMessage)`: Process user message and generate response
- `loadConversationHistory(userId)`: Load last 10 messages from Firestore
- `getFinancialContext(userId)`: Fetch comprehensive financial data

### Goal Creator Agent
**Location**: [backend/agents/goalAgent.js](backend/agents/goalAgent.js)

Creates personalized financial goals by:
- Analyzing user's income, expenses, and investments
- Considering conversation context for relevant goals
- Generating SMART goals with target amounts and deadlines
- Saving goals directly to Firestore

**Trigger Phrases**:
- "create a goal for me"
- "make a new goal"
- "set a financial goal"
- "help me with goal planning"

### Financial Summary Agent
**Location**: [backend/agents/financialSummaryAgent.js](backend/agents/financialSummaryAgent.js)

Generates AI-powered insights about:
- Overall financial health
- Spending patterns and trends
- Investment portfolio performance
- Areas for improvement

## API Documentation

### Chat Endpoints

#### POST /api/chat
Send a message to the AI chatbot.

**Request Body**:
```json
{
  "userId": "user123",
  "message": "How much did I spend on food this month?"
}
```

**Response**:
```json
{
  "success": true,
  "response": "Based on your data, you spent ₹5,240 on food this month...",
  "timestamp": "2025-11-29T10:30:00.000Z"
}
```

#### GET /api/chat/history?userId={userId}
Retrieve conversation history for a user.

### Financial Data Endpoints

#### POST /api/financial/upload
Upload a PDF document for processing.

**Request**: `multipart/form-data` with file field

**Response**:
```json
{
  "success": true,
  "message": "Financial data extracted and saved successfully",
  "data": {
    "transactions": [...],
    "holdings": [...],
    "bankAccounts": [...]
  }
}
```

#### GET /api/financial/transactions?userId={userId}
Retrieve user transactions.

#### GET /api/financial/holdings?userId={userId}&category={category}
Get investment holdings, optionally filtered by category (Stock, Mutual Fund, SIP).

### Goals Endpoints

#### GET /api/goals?userId={userId}
Retrieve all goals for a user.

## Database Schema

### Firestore Collections

**users/{userId}/transactions**
```javascript
{
  date: "2025-11-15",
  amount: 1500,
  type: "debit",
  description: "Grocery Shopping",
  category: "Food",
  timestamp: Timestamp
}
```

**users/{userId}/holdings**
```javascript
{
  instrumentName: "Reliance Industries",
  instrumentType: "Equity",
  category: "Stock",
  quantity: 10,
  averageBuyPrice: 2450,
  currentPrice: 2520,
  currency: "INR"
}
```

**users/{userId}/goals**
```javascript
{
  title: "Emergency Fund",
  description: "Build 6 months emergency fund",
  targetAmount: 300000,
  currentAmount: 50000,
  targetDate: "2026-06-30",
  category: "Savings",
  status: "active",
  createdBy: "ai-agent",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**users/{userId}/chatHistory**
```javascript
{
  role: "user",
  message: "How's my portfolio performing?",
  timestamp: Timestamp
}
```

## Authors

- **Alakh Babbar**
- **Mehar Satsangi**
- **Bhakti Johri**

## License

This project is part of Mumbai Hacks hackathon submission.

---

Built with Node.js, React, Firebase, and Google Gemini AI
