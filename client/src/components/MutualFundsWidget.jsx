import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { PieChart, RefreshCw } from 'lucide-react';

const MutualFundsWidget = ({ size = 'medium' }) => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMutualFunds();
  }, []);

  const fetchMutualFunds = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch(
        `http://localhost:3000/api/financial/holdings?userId=${user.uid}&category=Mutual Fund`
      );
      const data = await response.json();

      if (data.success) {
        setFunds(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching mutual funds:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = funds.reduce((sum, fund) => sum + (fund.quantity * fund.averageBuyPrice), 0);
  const totalCurrent = funds.reduce((sum, fund) => sum + (fund.quantity * fund.currentPrice), 0);
  const totalPnL = totalCurrent - totalInvested;
  const pnlPercentage = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

  const sizeClass = size === 'wide' ? 'col-span-2' : size === 'large' ? 'row-span-2' : '';

  if (loading) {
    return (
      <div className={`bg-zinc-900 rounded-xl p-6 border border-zinc-800 ${sizeClass}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-20 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (funds.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20 ${sizeClass}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-400/20 rounded-lg p-2">
            <PieChart className="w-6 h-6 text-purple-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Mutual Funds</h3>
            <p className="text-gray-500 text-xs">Track your MF investments</p>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No mutual funds found. Upload your portfolio to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/20 ${sizeClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-400/20 rounded-lg p-2">
            <PieChart className="w-6 h-6 text-purple-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Mutual Funds</h3>
            <p className="text-gray-500 text-xs">{funds.length} funds</p>
          </div>
        </div>
        <button
          onClick={fetchMutualFunds}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Total Summary */}
      <div className="bg-zinc-900/50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-xs mb-1">Invested</p>
            <p className="text-white text-xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Current</p>
            <p className="text-white text-xl font-bold">₹{totalCurrent.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-gray-500 text-xs">Total P&L</span>
          <div>
            <span className={`text-sm font-semibold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN')}
            </span>
            <span className={`ml-2 text-xs ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ({pnlPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Funds List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {funds.slice(0, 4).map((fund, index) => {
          const pnl = (fund.quantity * fund.currentPrice) - (fund.quantity * fund.averageBuyPrice);
          const pnlPct = ((pnl / (fund.quantity * fund.averageBuyPrice)) * 100).toFixed(2);
          
          return (
            <div key={fund.id || index} className="bg-zinc-900/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <p className="text-white text-sm font-medium">{fund.instrumentName}</p>
                <span className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPct}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{fund.quantity} units @ ₹{fund.averageBuyPrice}</span>
                <span>₹{(fund.quantity * fund.currentPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
        {funds.length > 4 && (
          <p className="text-center text-xs text-gray-500 pt-2">+{funds.length - 4} more funds</p>
        )}
      </div>
    </div>
  );
};

export default MutualFundsWidget;
