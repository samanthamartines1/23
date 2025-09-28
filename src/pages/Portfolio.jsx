import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import EnchantedButton from '../components/EnchantedButton';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState({
    totalValue: 125430.50,
    totalPnL: 8543.20,
    pnlPercentage: 7.32,
    availableBalance: 15420.30
  });

  const [holdings, setHoldings] = useState([
    {
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      amount: 2.5,
      avgPrice: 42000,
      currentPrice: 45200,
      value: 113000,
      pnl: 8000,
      pnlPercentage: 7.62
    },
    {
      symbol: 'ETHUSDT',
      name: 'Ethereum',
      amount: 15.2,
      avgPrice: 2800,
      currentPrice: 3100,
      value: 47120,
      pnl: 4560,
      pnlPercentage: 10.71
    },
    {
      symbol: 'ADAUSDT',
      name: 'Cardano',
      amount: 5000,
      avgPrice: 0.45,
      currentPrice: 0.52,
      value: 2600,
      pnl: 350,
      pnlPercentage: 15.56
    }
  ]);

  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPortfolio = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Portfolio</h1>
              <p className="text-gray-400">Track your trading performance</p>
            </div>
          </motion.div>

          <EnchantedButton
            onClick={refreshPortfolio}
            className="flex items-center space-x-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </EnchantedButton>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-400" />
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(portfolio.totalValue) : '••••••'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-lg rounded-xl p-6 border border-green-500/20"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p className="text-2xl font-bold text-green-400">
                {showBalance ? formatCurrency(portfolio.totalPnL) : '••••••'}
              </p>
              <p className="text-sm text-green-400">
                {formatPercentage(portfolio.pnlPercentage)}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-800/30 to-cyan-800/30 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(portfolio.availableBalance) : '••••••'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-800/30 to-red-800/30 backdrop-blur-lg rounded-xl p-6 border border-orange-500/20"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <PieChart className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Holdings</p>
              <p className="text-2xl font-bold text-white">{holdings.length}</p>
              <p className="text-sm text-orange-400">Active positions</p>
            </div>
          </motion.div>
        </div>

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden"
        >
          <div className="p-6 border-b border-purple-500/20">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Current Holdings</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-gray-400 font-medium">Asset</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Avg Price</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Current Price</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Value</th>
                  <th className="text-right p-4 text-gray-400 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding, index) => (
                  <motion.tr
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{holding.name}</p>
                        <p className="text-gray-400 text-sm">{holding.symbol}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right text-white">
                      {holding.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-white">
                      {formatCurrency(holding.avgPrice)}
                    </td>
                    <td className="p-4 text-right text-white">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="p-4 text-right text-white font-medium">
                      {formatCurrency(holding.value)}
                    </td>
                    <td className="p-4 text-right">
                      <div className={`${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <p className="font-medium">{formatCurrency(holding.pnl)}</p>
                        <p className="text-sm">{formatPercentage(holding.pnlPercentage)}</p>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;