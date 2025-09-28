import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const SpotTrading = () => {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [balance, setBalance] = useState({
    USDT: 10000,
    BTC: 0.5,
    ETH: 2.5,
    BNB: 10
  });

  const [marketData, setMarketData] = useState([
    { symbol: 'BTCUSDT', price: 43250.50, change: 2.45, volume: '24.5K BTC' },
    { symbol: 'ETHUSDT', price: 2650.75, change: -1.23, volume: '156.8K ETH' },
    { symbol: 'BNBUSDT', price: 315.20, change: 0.85, volume: '89.2K BNB' },
    { symbol: 'ADAUSDT', price: 0.485, change: 3.21, volume: '2.1M ADA' }
  ]);

  const [recentTrades, setRecentTrades] = useState([
    { id: 1, pair: 'BTCUSDT', side: 'buy', amount: 0.025, price: 43180.00, time: '14:32:15', status: 'filled' },
    { id: 2, pair: 'ETHUSDT', side: 'sell', amount: 1.5, price: 2655.30, time: '14:28:42', status: 'filled' },
    { id: 3, pair: 'BNBUSDT', side: 'buy', amount: 5.0, price: 314.85, time: '14:25:18', status: 'partial' }
  ]);

  const handleTrade = () => {
    const newTrade = {
      id: recentTrades.length + 1,
      pair: selectedPair,
      side,
      amount: parseFloat(amount),
      price: orderType === 'market' ? marketData.find(m => m.symbol === selectedPair)?.price : parseFloat(price),
      time: new Date().toLocaleTimeString(),
      status: 'filled'
    };
    setRecentTrades([newTrade, ...recentTrades]);
    setAmount('');
    setPrice('');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Spot Trading
          </h1>
          <p className="text-gray-400">Trade cryptocurrencies with real-time market data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-400" />
                Place Order
              </h2>

              {/* Pair Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  {marketData.map(pair => (
                    <option key={pair.symbol} value={pair.symbol}>{pair.symbol}</option>
                  ))}
                </select>
              </div>

              {/* Order Type */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType('market')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      orderType === 'market'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      orderType === 'limit'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      side === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      side === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Price Input (for limit orders) */}
              {orderType === 'limit' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (USDT)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Trade Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTrade}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  side === 'buy'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                } text-white shadow-lg`}
              >
                {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.replace('USDT', '')}
              </motion.button>
            </div>

            {/* Balance */}
            <div className="mt-6 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                Wallet Balance
              </h3>
              {Object.entries(balance).map(([asset, amount]) => (
                <div key={asset} className="flex justify-between items-center py-2">
                  <span className="text-gray-300">{asset}</span>
                  <span className="text-white font-medium">{amount.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Market Data & Recent Trades */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Market Data */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
                Market Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketData.map((pair) => (
                  <motion.div
                    key={pair.symbol}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-all"
                    onClick={() => setSelectedPair(pair.symbol)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{pair.symbol}</h3>
                      <div className={`flex items-center text-sm ${
                        pair.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pair.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {pair.change >= 0 ? '+' : ''}{pair.change}%
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${pair.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      Vol: {pair.volume}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-400" />
                Recent Trades
              </h2>
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          trade.side === 'buy' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium">{trade.pair}</div>
                          <div className="text-sm text-gray-400">{trade.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {trade.amount} @ ${trade.price?.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm">
                          {trade.status === 'filled' ? (
                            <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-400 mr-1" />
                          )}
                          <span className={trade.status === 'filled' ? 'text-green-400' : 'text-yellow-400'}>
                            {trade.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SpotTrading;