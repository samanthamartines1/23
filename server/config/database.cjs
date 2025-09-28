const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'enchanted_trading',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };
  }

  async initialize() {
    try {
      // Create connection pool
      this.pool = mysql.createPool(this.config);
      
      // Test the connection
      const connection = await this.pool.getConnection();
      console.log('✅ Database connected successfully');
      
      // Release the test connection
      connection.release();
      
      // Check if database exists and has tables
      await this.ensureDatabaseSetup();
      
      return this.pool;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      
      // Try to create database if it doesn't exist
      if (error.code === 'ER_BAD_DB_ERROR') {
        await this.createDatabase();
        return this.initialize();
      }
      
      throw error;
    }
  }

  async ensureDatabaseSetup() {
    try {
      // Check if users table exists
      const [tables] = await this.pool.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'",
        [this.config.database]
      );
      
      if (tables[0].count === 0) {
        console.log('📋 Database tables not found, creating schema...');
        await this.createSchema();
      } else {
        console.log('✅ Database schema already exists');
      }
    } catch (error) {
      console.error('❌ Error checking database schema:', error.message);
      throw error;
    }
  }

  async createSchema() {
    try {
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error('Schema file not found at: ' + schemaPath);
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split the schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📋 Executing ${statements.length} SQL statements...`);
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await this.pool.execute(statement);
          } catch (error) {
            // Skip errors for statements that might already exist
            if (!error.message.includes('already exists') && 
                !error.message.includes('Duplicate key name') &&
                !error.message.includes('Duplicate entry')) {
              console.warn('⚠️ SQL Warning:', error.message);
            }
          }
        }
      }
      
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.error('❌ Error creating database schema:', error.message);
      throw error;
    }
  }
  async createDatabase() {
    try {
      const tempConfig = { ...this.config };
      delete tempConfig.database;
      
      const tempPool = mysql.createPool(tempConfig);
      const connection = await tempPool.getConnection();
      
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${this.config.database}' created successfully`);
      
      connection.release();
      await tempPool.end();
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection closed');
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const [rows] = await this.pool.execute('SELECT 1 as health');
      return rows[0].health === 1;
    } catch (error) {
      console.error('Database health check failed:', error.message);
      return false;
    }
  }

  // Get connection for advanced operations
  async getConnection() {
    return await this.pool.getConnection();
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;