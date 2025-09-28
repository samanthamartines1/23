class MockDataService {
  constructor() {
    this.signals = [];
    this.portfolio = {
      balance: 10000,
      pnl: 245.67,
      positions: 3
    };
    this.initializeMockData();
  }

  initializeMockData() {
    // Generate some initial mock signals
    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    const timeframes = ['5m', '15m', '1h', '4h'];
    
    for (let i = 0; i < 6; i++) {
      const signal = this.createMockSignal(
        pairs[Math.floor(Math.random() * pairs.length)],
        timeframes[Math.floor(Math.random() * timeframes.length)]
      );
      this.signals.push(signal);
    }
  }

  createMockSignal(pair = 'BTC/USDT', timeframe = '1h') {
    const isPositive = Math.random() > 0.5;
    const basePrice = this.getBasePriceForPair(pair);
    const priceVariation = basePrice * (Math.random() * 0.02 - 0.01); // ±1% variation
    
    return {
      id: Date.now() + Math.random(),
      pair,
      type: isPositive ? 'BUY' : 'SELL',
      price: basePrice + priceVariation,
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      timeframe,
      indicators: {
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 0.01,
        volume: Math.random() * 50 + 10,
        sma20: basePrice * (0.98 + Math.random() * 0.04),
        ema12: basePrice * (0.99 + Math.random() * 0.02)
      },
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };
  }

  getBasePriceForPair(pair) {
    const prices = {
      'BTC/USDT': 43250,
      'ETH/USDT': 2650,
      'BNB/USDT': 315,
      'ADA/USDT': 0.52,
      'SOL/USDT': 98.5,
      'DOT/USDT': 7.2
    };
    return prices[pair] || 100;
  }

  async generateSignal(pair, timeframe) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const signal = this.createMockSignal(pair, timeframe);
    this.signals.unshift(signal);
    return signal;
  }

  async getAllSignals() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.signals].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getRecentSignals(limit = 6) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.signals
      .filter(signal => signal.status === 'ACTIVE')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async getPortfolioData() {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Simulate some random portfolio changes
    const pnlChange = (Math.random() - 0.5) * 10;
    this.portfolio.pnl += pnlChange;
    return { ...this.portfolio };
  }

  async updatePortfolio(balance, pnl, positions) {
    await new Promise(resolve => setTimeout(resolve, 200));
    this.portfolio = { balance, pnl, positions };
    return this.portfolio;
  }

  async saveTrade(trade) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const tradeId = Date.now();
    // In a real app, this would save to a database
    console.log('Mock trade saved:', { id: tradeId, ...trade });
    return tradeId;
  }

  async getTradeHistory(limit = 100) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Generate mock trade history
    const trades = [];
    for (let i = 0; i < Math.min(limit, 20); i++) {
      const signal = this.signals[i % this.signals.length];
      trades.push({
        id: i + 1,
        signal_id: signal?.id || i,
        pair: signal?.pair || 'BTC/USDT',
        type: signal?.type || (Math.random() > 0.5 ? 'BUY' : 'SELL'),
        entry_price: signal?.price || 43000,
        exit_price: signal?.price ? signal.price * (1 + (Math.random() - 0.5) * 0.05) : null,
        quantity: Math.random() * 0.1 + 0.01,
        pnl: (Math.random() - 0.4) * 100, // Slightly positive bias
        status: Math.random() > 0.3 ? 'CLOSED' : 'OPEN',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: signal?.confidence || Math.floor(Math.random() * 40) + 60
      });
    }
    
    return trades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async updateSignalStatus(signalId, status) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const signal = this.signals.find(s => s.id === signalId);
    if (signal) {
      signal.status = status;
    }
    return signal;
  }

  async getMarketStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const recentSignals = this.signals.filter(s => {
      const signalTime = new Date(s.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return signalTime > dayAgo;
    });
    
    return {
      signals: {
        total_signals: recentSignals.length,
        buy_signals: recentSignals.filter(s => s.type === 'BUY').length,
        sell_signals: recentSignals.filter(s => s.type === 'SELL').length,
        avg_confidence: recentSignals.length > 0 
          ? recentSignals.reduce((acc, s) => acc + s.confidence, 0) / recentSignals.length 
          : 0
      },
      trades: {
        total_trades: Math.floor(Math.random() * 50) + 20,
        profitable_trades: Math.floor(Math.random() * 30) + 15,
        avg_pnl: (Math.random() - 0.3) * 50 // Slightly positive bias
      }
    };
  }

  // Simulate real-time price updates
  simulateRealTimeUpdates(callback) {
    const interval = setInterval(() => {
      // Update some signal prices
      this.signals.forEach(signal => {
        if (Math.random() > 0.8) { // 20% chance to update each signal
          const variation = signal.price * (Math.random() * 0.002 - 0.001); // ±0.1% variation
          signal.price += variation;
        }
      });
      
      // Update portfolio
      const pnlChange = (Math.random() - 0.5) * 2;
      this.portfolio.pnl += pnlChange;
      
      if (callback) {
        callback({
          signals: this.signals,
          portfolio: this.portfolio
        });
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }

  // Clear all data (for testing)
  clearAllData() {
    this.signals = [];
    this.portfolio = {
      balance: 10000,
      pnl: 0,
      positions: 0
    };
  }
}

export default new MockDataService();