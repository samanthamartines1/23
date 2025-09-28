const database = require('../config/database.cjs');

class Signal {
  static async create(signalData) {
    const {
      userId,
      pair,
      type,
      price,
      confidence,
      timeframe,
      indicators = {},
      technicalAnalysis = {},
      riskRewardRatio,
      stopLoss,
      takeProfit,
      expiresAt
    } = signalData;

    const sql = `
      INSERT INTO signals (
        user_id, pair, type, price, confidence, timeframe, 
        indicators, technical_analysis, risk_reward_ratio, 
        stop_loss, take_profit, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId, pair, type, price, confidence, timeframe,
      JSON.stringify(indicators), JSON.stringify(technicalAnalysis),
      riskRewardRatio, stopLoss, takeProfit, expiresAt
    ];

    const result = await database.query(sql, params);
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT s.*, u.username 
      FROM signals s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `;
    
    const signals = await database.query(sql, [id]);
    if (signals.length === 0) return null;

    const signal = signals[0];
    try {
      signal.indicators = JSON.parse(signal.indicators || '{}');
      signal.technical_analysis = JSON.parse(signal.technical_analysis || '{}');
    } catch (e) {
      signal.indicators = {};
      signal.technical_analysis = {};
    }
    
    return signal;
  }

  static async findByUser(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM signals 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const signals = await database.query(sql, [userId, limit, offset]);
    
    return signals.map(signal => ({
      ...signal,
      indicators: this.parseJSON(signal.indicators),
      technical_analysis: this.parseJSON(signal.technical_analysis)
    }));
  }

  static async findActive(limit = 20) {
    const sql = `
      SELECT s.*, u.username 
      FROM signals s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'ACTIVE' 
        AND (s.expires_at IS NULL OR s.expires_at > NOW())
      ORDER BY s.created_at DESC 
      LIMIT ?
    `;
    
    const signals = await database.query(sql, [limit]);
    
    return signals.map(signal => ({
      ...signal,
      indicators: this.parseJSON(signal.indicators),
      technical_analysis: this.parseJSON(signal.technical_analysis)
    }));
  }

  static parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString || '{}');
    } catch (e) {
      return {};
    }
  }

  static async updateStatus(id, status) {
    const sql = 'UPDATE signals SET status = ?, updated_at = NOW() WHERE id = ?';
    await database.query(sql, [status, id]);
  }

  static async expireOldSignals() {
    const sql = `
      UPDATE signals 
      SET status = 'EXPIRED', updated_at = NOW() 
      WHERE status = 'ACTIVE' 
        AND expires_at IS NOT NULL 
        AND expires_at <= NOW()
    `;
    
    const result = await database.query(sql);
    return result.affectedRows;
  }

  static async getStats(userId = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_signals,
        SUM(CASE WHEN type = 'BUY' THEN 1 ELSE 0 END) as buy_signals,
        SUM(CASE WHEN type = 'SELL' THEN 1 ELSE 0 END) as sell_signals,
        AVG(confidence) as avg_confidence,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_signals,
        COUNT(CASE WHEN status = 'EXECUTED' THEN 1 END) as executed_signals
      FROM signals
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;
    
    const params = [];
    
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    
    const stats = await database.query(sql, params);
    return stats[0];
  }

  static async delete(id, userId) {
    const sql = 'DELETE FROM signals WHERE id = ? AND user_id = ?';
    const result = await database.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  static async generateMockSignal(pair = 'BTCUSDT', timeframe = '1h') {
    const types = ['BUY', 'SELL'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const basePrices = {
      'BTCUSDT': 43250,
      'ETHUSDT': 2650,
      'BNBUSDT': 315,
      'ADAUSDT': 0.52,
      'SOLUSDT': 98.5,
      'DOTUSDT': 7.2
    };
    
    const basePrice = basePrices[pair] || 100;
    const priceVariation = basePrice * (Math.random() * 0.02 - 0.01);
    const price = basePrice + priceVariation;
    
    const indicators = {
      rsi: Math.random() * 100,
      macd: (Math.random() - 0.5) * 0.01,
      volume: Math.random() * 50 + 10,
      sma20: basePrice * (0.98 + Math.random() * 0.04),
      ema12: basePrice * (0.99 + Math.random() * 0.02)
    };
    
    const technicalAnalysis = {
      trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      support: price * 0.98,
      resistance: price * 1.02,
      momentum: Math.random() > 0.5 ? 'STRONG' : 'WEAK'
    };
    
    return {
      userId: 1,
      pair,
      type,
      price: parseFloat(price.toFixed(8)),
      confidence: Math.floor(Math.random() * 40) + 60,
      timeframe,
      indicators,
      technicalAnalysis,
      riskRewardRatio: 1 + Math.random() * 2,
      stopLoss: type === 'BUY' ? price * 0.98 : price * 1.02,
      takeProfit: type === 'BUY' ? price * 1.06 : price * 0.94,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000)
    };
  }
}

module.exports = Signal;