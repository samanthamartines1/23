import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = localStorage.getItem('authToken');
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          // Don't redirect for now, just log the error
        }
        // Return a mock response for development
        return Promise.resolve({
          data: {
            success: false,
            message: 'API unavailable - using mock data',
            data: null
          }
        });
      }
    );
  }

  // Auth methods
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
        this.token = response.data.data.token;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
        this.token = response.data.data.token;
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  // Signal methods
  async getSignals(limit = 50, offset = 0) {
    try {
      const response = await this.api.get('/signals', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Signals fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async getActiveSignals(limit = 20) {
    try {
      const response = await this.api.get('/signals/active', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Active signals fetch error:', error);
      // Return mock signals for development
      return {
        success: true,
        data: [
          {
            id: 1,
            pair: 'BTCUSDT',
            type: 'BUY',
            price: 43250.50,
            confidence: 87.5,
            timeframe: '1h',
            indicators: { rsi: 65, macd: 0.125, volume: 28450 },
            timestamp: new Date().toISOString(),
            status: 'ACTIVE'
          },
          {
            id: 2,
            pair: 'ETHUSDT',
            type: 'SELL',
            price: 2650.75,
            confidence: 82.3,
            timeframe: '4h',
            indicators: { rsi: 75, macd: -0.089, volume: 156780 },
            timestamp: new Date().toISOString(),
            status: 'ACTIVE'
          }
        ]
      };
    }
  }

  async generateSignal(pair, timeframe) {
    try {
      const response = await this.api.post('/signals/generate', { pair, timeframe });
      return response.data;
    } catch (error) {
      console.error('Signal generation error:', error);
      throw error;
    }
  }

  async generateAISignal(symbol, timeframe) {
    try {
      const response = await this.api.post('/ai/generate-signal', { symbol, timeframe });
      return response.data;
    } catch (error) {
      console.error('AI signal generation error:', error);
      throw error;
    }
  }

  // Portfolio methods
  async getPortfolio() {
    try {
      const response = await this.api.get('/portfolio');
      return response.data;
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      // Return mock portfolio for development
      return {
        success: true,
        data: {
          total_balance: 10000.00,
          available_balance: 8500.00,
          total_pnl: 245.67,
          daily_pnl: 45.20,
          active_positions: 3,
          win_rate: 68.5
        }
      };
    }
  }

  async getHoldings() {
    try {
      const response = await this.api.get('/portfolio/holdings');
      return response.data;
    } catch (error) {
      console.error('Holdings fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async getPortfolioSummary() {
    try {
      const response = await this.api.get('/portfolio/summary');
      return response.data;
    } catch (error) {
      console.error('Portfolio summary fetch error:', error);
      return { success: false, data: null };
    }
  }

  // Trade methods
  async getTrades(limit = 50, offset = 0, status = null) {
    try {
      const params = { limit, offset };
      if (status) params.status = status;
      
      const response = await this.api.get('/trades', { params });
      return response.data;
    } catch (error) {
      console.error('Trades fetch error:', error);
      // Return mock trades for development
      return {
        success: true,
        data: [
          {
            id: 1,
            pair: 'BTCUSDT',
            side: 'BUY',
            quantity: 0.1,
            entry_price: 42000,
            exit_price: 43250,
            realized_pnl: 125.0,
            status: 'CLOSED',
            created_at: new Date().toISOString()
          }
        ]
      };
    }
  }

  async getTradeHistory(filters = {}) {
    try {
      const response = await this.api.get('/trades/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Trade history fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async createTrade(tradeData) {
    try {
      const response = await this.api.post('/trades', tradeData);
      return response.data;
    } catch (error) {
      console.error('Trade creation error:', error);
      throw error;
    }
  }

  async closeTrade(tradeId, exitPrice, fees = 0, notes = null) {
    try {
      const response = await this.api.put(`/trades/${tradeId}/close`, {
        exitPrice,
        fees,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Trade close error:', error);
      throw error;
    }
  }

  // Market data methods
  async getMarketPrices(symbols = []) {
    try {
      const response = await this.api.get('/market/prices', {
        params: { symbols: symbols.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Market prices fetch error:', error);
      // Return mock market data for development
      return {
        success: true,
        data: [
          { symbol: 'BTCUSDT', price: 43250.50, change_percentage_24h: 2.98 },
          { symbol: 'ETHUSDT', price: 2650.75, change_percentage_24h: -1.68 }
        ]
      };
    }
  }

  async getMarketOverview() {
    try {
      const response = await this.api.get('/market/overview');
      return response.data;
    } catch (error) {
      console.error('Market overview fetch error:', error);
      return { success: false, data: [] };
    }
  }

  async getPriceHistory(symbol, hours = 24) {
    try {
      const response = await this.api.get(`/market/history/${symbol}`, {
        params: { hours }
      });
      return response.data;
    } catch (error) {
      console.error('Price history fetch error:', error);
      return { success: false, data: [] };
    }
  }

  // Utility methods
  logout() {
    localStorage.removeItem('authToken');
    this.token = null;
    window.location.href = '/';
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get('http://localhost:5000/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, status: 'unhealthy' };
    }
  }
}

export default new ApiService();