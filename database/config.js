const mysql = require('mysql2/promise');

class DatabaseConfig {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'date_night_app',
            port: process.env.DB_PORT || 3306,
            charset: 'utf8mb4',
            timezone: '+00:00',
            connectTimeout: 60000,
            // Remove invalid config options for mysql2
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        
        this.pool = null;
    }

    async initialize() {
        try {
            this.pool = mysql.createPool({
                ...this.config,
                idleTimeout: 300000,
                enableKeepAlive: true
            });

            // Test connection
            const connection = await this.pool.getConnection();
            console.log('✅ Database connected successfully');
            connection.release();
            
            return this.pool;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    getPool() {
        if (!this.pool) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.pool;
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Database connection closed');
        }
    }
}

module.exports = new DatabaseConfig();
