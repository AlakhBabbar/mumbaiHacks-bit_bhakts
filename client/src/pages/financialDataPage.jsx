import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FinancialDataUpload from '../components/FinancialDataUpload';
import ChatBot from '../components/ChatBot';

const FinancialDataPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-400 mb-2">
                  Financial Data Management
                </h1>
                <p className="text-gray-400">
                  Upload and manage your financial documents
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <FinancialDataUpload />

          {/* Additional Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* How it works */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How It Works
              </h3>
              <ol className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Upload your bank statement or financial document in PDF format</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Our AI extracts and structures your financial data automatically</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Data is securely saved to your account for analysis and insights</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                  <span>Access your organized financial data anytime from your dashboard</span>
                </li>
              </ol>
            </div>

            {/* Security & Privacy */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security & Privacy
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>End-to-end encrypted document processing</span>
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Documents are automatically deleted after processing</span>
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your data is stored securely in Firebase Firestore</span>
                </li>
                <li className="flex gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Only you can access your financial information</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 max-w-4xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips for Best Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold mb-2">✓ Clear Documents</p>
                <p className="text-gray-400">Upload high-quality, readable PDF documents for accurate extraction</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold mb-2">✓ Complete Statements</p>
                <p className="text-gray-400">Full bank statements work best - they contain all necessary transaction details</p>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-emerald-400 font-semibold mb-2">✓ Multiple Sources</p>
                <p className="text-gray-400">Upload documents from different accounts to build a complete financial picture</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating ChatBot */}
      <ChatBot />
    </div>
  );
};

export default FinancialDataPage;
