import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/ApiService';
import useWebSocket from '../hooks/useWebSocket';

const TradingContext = createContext();

const initialState = {
  user: null,
  portfolio: null,
  signals: [],
  trades: [],
  marketData: [],
  isLoading: false,
  error: null,
  isAuthenticated: false
};

const tradingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    
    case 'SET_SIGNALS':
      return { ...state, signals: action.payload };
    
    case 'ADD_SIGNAL':
      return { ...state, signals: [action.payload, ...state.signals] };
    
    case 'SET_TRADES':
      return { ...state, trades: action.payload };
    
    case 'ADD_TRADE':
      return { ...state, trades: [action.payload, ...state.trades] };
    
    case 'UPDATE_TRADE':
      return {
        ...state,
        trades: state.trades.map(trade =>
          trade.id === action.payload.id ? action.payload : trade
        )
      };
    
    case 'SET_MARKET_DATA':
      return { ...state, marketData: action.payload };
    
    case 'UPDATE_MARKET_DATA':
      return {
        ...state,
        marketData: state.marketData.map(data =>
          data.symbol === action.payload.symbol ? action.payload : data
        )
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return { ...initialState };
    
    default:
      return state;
  }
};

export const TradingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const { lastMessage, isConnected, sendMessage } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'market_data':
          dispatch({ type: 'SET_MARKET_DATA', payload: lastMessage.data });
          break;
        
        case 'price_update':
          dispatch({ type: 'UPDATE_MARKET_DATA', payload: lastMessage.data });
          break;
        
        case 'signal_alert':
          dispatch({ type: 'ADD_SIGNAL', payload: lastMessage.data });
          break;
        
        case 'trade_update':
          dispatch({ type: 'UPDATE_TRADE', payload: lastMessage.data });
          break;
        
        case 'portfolio_update':
          dispatch({ type: 'SET_PORTFOLIO', payload: lastMessage.data });
          break;
        
        default:
          break;
      }
    }
  }, [lastMessage]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Set default user for demo
        dispatch({ type: 'SET_USER', payload: { 
          id: 1, 
          username: 'demo_user', 
          email: 'demo@example.com' 
        }});
        
        const [portfolioRes, signalsRes, tradesRes] = await Promise.all([
          ApiService.getPortfolio(),
          ApiService.getActiveSignals(),
          ApiService.getTrades(10)
        ]);

        if (portfolioRes.success) {
          dispatch({ type: 'SET_PORTFOLIO', payload: portfolioRes.data });
        }
        
        if (signalsRes.success) {
          dispatch({ type: 'SET_SIGNALS', payload: signalsRes.data });
        }
        
        if (tradesRes.success) {
          dispatch({ type: 'SET_TRADES', payload: tradesRes.data });
        }
        
      } catch (error) {
        console.error('Initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeData();
  }, []);

  // Actions
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await ApiService.login(email, password);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.data });
        // Reload data after login
        window.location.reload();
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    ApiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const generateSignal = async (pair, timeframe) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await ApiService.generateAISignal(pair, timeframe);
      
      if (result.success) {
        dispatch({ type: 'ADD_SIGNAL', payload: result.data });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTrade = async (tradeData) => {
    try {
      const result = await ApiService.createTrade(tradeData);
      
      if (result.success) {
        dispatch({ type: 'ADD_TRADE', payload: result.data });
      }
      
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [signalsRes, portfolioRes, tradesRes] = await Promise.all([
        ApiService.getActiveSignals(),
        ApiService.getPortfolio(),
        ApiService.getTrades(10)
      ]);

      if (signalsRes.success) {
        dispatch({ type: 'SET_SIGNALS', payload: signalsRes.data });
      }
      
      if (portfolioRes.success) {
        dispatch({ type: 'SET_PORTFOLIO', payload: portfolioRes.data });
      }
      
      if (tradesRes.success) {
        dispatch({ type: 'SET_TRADES', payload: tradesRes.data });
      }
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    isWebSocketConnected: isConnected,
    actions: {
      login,
      logout,
      generateSignal,
      createTrade,
      refreshData,
      clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

export default TradingContext;