import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { TrendingUp, RefreshCw } from 'lucide-react';

const StockPortfolioWidget = ({ size = 'wide' }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch(
        `http://localhost:3000/api/financial/holdings?userId=${user.uid}&category=Stock`
      );
      const data = await response.json();

      if (data.success) {
        setStocks(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.averageBuyPrice), 0);
  const totalCurrent = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
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

  if (stocks.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 rounded-xl p-6 border border-emerald-400/20 ${sizeClass}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-400/20 rounded-lg p-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Stock Portfolio</h3>
            <p className="text-gray-500 text-xs">Real-time portfolio tracking</p>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No stocks found. Upload your portfolio to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 rounded-xl p-6 border border-emerald-400/20 ${sizeClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-400/20 rounded-lg p-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Stock Portfolio</h3>
            <p className="text-gray-500 text-xs">{stocks.length} stocks</p>
          </div>
        </div>
        <button
          onClick={fetchStocks}
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Summary */}
        <div className="bg-zinc-900/50 rounded-lg p-4">
          <p className="text-gray-500 text-xs mb-2">Portfolio Value</p>
          <p className="text-white text-2xl font-bold mb-3">₹{totalCurrent.toLocaleString('en-IN')}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Invested: ₹{totalInvested.toLocaleString('en-IN')}</span>
            <span className={`font-semibold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN')} ({pnlPercentage}%)
            </span>
          </div>
        </div>

        {/* Top Stock */}
        {stocks[0] && (() => {
          const topStock = stocks.reduce((prev, current) => {
            const prevPnL = (prev.quantity * prev.currentPrice) - (prev.quantity * prev.averageBuyPrice);
            const currentPnL = (current.quantity * current.currentPrice) - (current.quantity * current.averageBuyPrice);
            return currentPnL > prevPnL ? current : prev;
          });
          const pnl = (topStock.quantity * topStock.currentPrice) - (topStock.quantity * topStock.averageBuyPrice);
          const pnlPct = ((pnl / (topStock.quantity * topStock.averageBuyPrice)) * 100).toFixed(2);

          return (
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-2">Top Performer</p>
              <p className="text-white text-lg font-bold mb-1">{topStock.instrumentName}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{topStock.quantity} shares</span>
                <span className={`font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPct}%
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Stocks List */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {stocks.map((stock, index) => {
          const pnl = (stock.quantity * stock.currentPrice) - (stock.quantity * stock.averageBuyPrice);
          const pnlPct = ((pnl / (stock.quantity * stock.averageBuyPrice)) * 100).toFixed(2);
          
          return (
            <div key={stock.id || index} className="bg-zinc-900/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{stock.instrumentName}</p>
                <p className="text-gray-500 text-xs">{stock.quantity} shares @ ₹{stock.averageBuyPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-semibold">₹{(stock.quantity * stock.currentPrice).toLocaleString('en-IN')}</p>
                <p className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPct}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockPortfolioWidget;
