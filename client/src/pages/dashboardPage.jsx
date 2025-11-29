import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import MutualFundsWidget from '../components/MutualFundsWidget';
import StockPortfolioWidget from '../components/StockPortfolioWidget';
import ChatBot from '../components/ChatBot';
import { Bot, TrendingUp, TrendingDown, CreditCard, PieChart, Activity, Repeat, DollarSign, UtensilsCrossed, Car, ShoppingBag, Film, Zap, Stethoscope, BarChart3, FileText } from 'lucide-react';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [sips, setSips] = useState([]);
  const [topSpend, setTopSpend] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData({ uid: user.uid, ...userDoc.data() });
          }
          
          // Fetch all financial data
          const [txnRes, stockRes, mfRes, sipRes] = await Promise.all([
            fetch(`http://localhost:3000/api/financial/transactions?userId=${user.uid}&limit=10`),
            fetch(`http://localhost:3000/api/financial/holdings?userId=${user.uid}&category=Stock`),
            fetch(`http://localhost:3000/api/financial/holdings?userId=${user.uid}&category=Mutual Fund`),
            fetch(`http://localhost:3000/api/financial/holdings?userId=${user.uid}&category=SIP`)
          ]);

          const [txnData, stockData, mfData, sipData] = await Promise.all([
            txnRes.json(),
            stockRes.json(),
            mfRes.json(),
            sipRes.json()
          ]);

          if (txnData.success) setTransactions(txnData.data || []);
          if (stockData.success) setStocks(stockData.data || []);
          if (mfData.success) setMutualFunds(mfData.data || []);
          if (sipData.success) setSips(sipData.data || []);

          // Calculate top spend category
          if (txnData.success && txnData.data.length > 0) {
            const categorySpend = {};
            txnData.data
              .filter(t => t.type === 'debit')
              .forEach(t => {
                categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
              });
            
            const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];
            if (topCategory) {
              setTopSpend({ category: topCategory[0], amount: topCategory[1] });
            }
          }

          // Fetch AI summary
          setSummaryLoading(true);
          try {
            const summaryRes = await fetch(`http://localhost:3000/api/financial/ai-summary?userId=${user.uid}`);
            const summaryData = await summaryRes.json();
            if (summaryData.success) {
              setAiSummary(summaryData.summary);
            }
          } catch (err) {
            console.error('Error fetching AI summary:', err);
          } finally {
            setSummaryLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  const getCategoryIcon = (category) => {
    const iconProps = { className: "w-5 h-5", strokeWidth: 2 };
    const icons = {
      'Food': <UtensilsCrossed {...iconProps} />,
      'Transport': <Car {...iconProps} />,
      'Shopping': <ShoppingBag {...iconProps} />,
      'Entertainment': <Film {...iconProps} />,
      'Bills': <Zap {...iconProps} />,
      'Healthcare': <Stethoscope {...iconProps} />,
      'Investment': <TrendingUp {...iconProps} />,
      'Salary': <DollarSign {...iconProps} />,
      'Other': <FileText {...iconProps} />
    };
    return icons[category] || <CreditCard {...iconProps} />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-400 text-xl">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-black">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-400 mb-2">
              Welcome back, {userData?.fullName?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-gray-500 text-sm">Your financial dashboard</p>
          </div>

          {/* AI Financial Summary */}
          <div className="bg-gradient-to-r from-emerald-400/10 to-blue-400/10 border border-emerald-400/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-400/20 rounded-full p-3 flex-shrink-0">
                <Bot className="w-6 h-6 text-emerald-400" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold mb-2 flex items-center gap-2">
                  AI Financial Insights
                  {summaryLoading && (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h3>
                {summaryLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-800 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse"></div>
                  </div>
                ) : aiSummary ? (
                  <p className="text-gray-300 text-sm leading-relaxed">{aiSummary}</p>
                ) : (
                  <p className="text-gray-500 text-sm">Upload your financial data to get personalized AI insights.</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Spend Banner */}
          {topSpend && (
            <div className="bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 border border-emerald-400/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-400/20 rounded-full p-4 text-emerald-400">
                    <div className="w-8 h-8">{getCategoryIcon(topSpend.category)}</div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Top Spending Category</p>
                    <h3 className="text-white text-2xl font-bold">{topSpend.category}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                  <p className="text-white text-3xl font-bold">₹{topSpend.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Credit Score */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-400/10 rounded-full p-4">
                  <CreditCard className="w-8 h-8 text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Credit Score</p>
                  <h3 className="text-white text-2xl font-bold">---</h3>
                  <p className="text-gray-400 text-xs">Not Available</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-32 h-32">
                  <svg className="transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#34d399" strokeWidth="8" 
                      strokeDasharray={`0 251.2`} strokeLinecap="round"/>
                  </svg>
                  <p className="text-center text-gray-500 text-xs mt-2">Max: 900</p>
                </div>
              </div>
            </div>
          </div>



          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Stocks Widget */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={2} /> Stocks
                  </h3>
                  <span className="text-emerald-400 text-xs">{stocks.length} holdings</span>
                </div>
                {stocks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No stocks found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {stocks.map((stock, idx) => {
                      const pnl = (stock.quantity * stock.currentPrice) - (stock.quantity * stock.averageBuyPrice);
                      const pnlPct = ((pnl / (stock.quantity * stock.averageBuyPrice)) * 100).toFixed(2);
                      return (
                        <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white font-medium text-sm">{stock.instrumentName}</p>
                            <span className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pnl >= 0 ? '+' : ''}{pnlPct}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{stock.quantity} shares @ ₹{stock.averageBuyPrice}</span>
                            <span className="text-white">₹{(stock.quantity * stock.currentPrice).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mutual Funds Widget */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" strokeWidth={2} /> Mutual Funds
                  </h3>
                  <span className="text-purple-400 text-xs">{mutualFunds.length} funds</span>
                </div>
                {mutualFunds.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No mutual funds found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {mutualFunds.map((fund, idx) => {
                      const pnl = (fund.quantity * fund.currentPrice) - (fund.quantity * fund.averageBuyPrice);
                      const pnlPct = ((pnl / (fund.quantity * fund.averageBuyPrice)) * 100).toFixed(2);
                      return (
                        <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white font-medium text-sm">{fund.instrumentName}</p>
                            <span className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pnl >= 0 ? '+' : ''}{pnlPct}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{fund.quantity} units @ ₹{fund.averageBuyPrice}</span>
                            <span className="text-white">₹{(fund.quantity * fund.currentPrice).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SIPs Widget */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-blue-400" strokeWidth={2} /> SIPs
                  </h3>
                  <span className="text-blue-400 text-xs">{sips.length} active</span>
                </div>
                {sips.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No SIPs found</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sips.map((sip, idx) => {
                      const pnl = (sip.quantity * sip.currentPrice) - (sip.quantity * sip.averageBuyPrice);
                      const pnlPct = ((pnl / (sip.quantity * sip.averageBuyPrice)) * 100).toFixed(2);
                      return (
                        <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white font-medium text-sm">{sip.instrumentName}</p>
                            <span className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pnl >= 0 ? '+' : ''}{pnlPct}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{sip.quantity} units @ ₹{sip.averageBuyPrice}</span>
                            <span className="text-white">₹{(sip.quantity * sip.currentPrice).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" strokeWidth={2} /> Recent Transactions
              </h3>
              <span className="text-gray-500 text-xs">{transactions.length} transactions</span>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">No transactions found. Upload your bank statement to get started.</p>
                <a 
                  href="/financial-data"
                  className="inline-block bg-emerald-400 text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-300 transition-colors"
                >
                  Upload Statement
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn, idx) => (
                  <div key={idx} className="bg-zinc-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-700 rounded-lg p-2 text-emerald-400">
                        {getCategoryIcon(txn.category)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{txn.description}</p>
                        <p className="text-gray-500 text-xs">{formatDate(txn.date)} • {txn.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-gray-500 text-xs">{txn.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Floating ChatBot */}
      <ChatBot />
    </>
  );
};

export default Dashboard;
