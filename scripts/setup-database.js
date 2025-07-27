#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Setting up Date Night Database...\n');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    };

    let connection;

    try {
        // Connect to MySQL (without specifying database)
        console.log('📡 Connecting to MySQL server...');
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL server');

        // Read and execute schema
        console.log('📄 Reading database schema...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        console.log('🔨 Creating database and tables...');
        await connection.query(schema);
        console.log('✅ Database schema created successfully');

        // Test the database
        console.log('🧪 Testing database connection...');
        await connection.query('USE date_night_app');
        const [tables] = await connection.query('SHOW TABLES');
        
        console.log('📊 Created tables:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Update your .env file with the correct database credentials');
        console.log('2. Run: npm install');
        console.log('3. Run: npm start');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Database access denied. Please check:');
            console.log('- MySQL username and password in .env file');
            console.log('- MySQL server is running');
            console.log('- User has necessary privileges');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Connection refused. Please check:');
            console.log('- MySQL server is running');
            console.log('- Correct host and port in .env file');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Check if .env exists
async function checkEnvironment() {
    const envPath = path.join(__dirname, '../.env');
    
    try {
        await fs.access(envPath);
        console.log('✅ .env file found');
    } catch (error) {
        console.log('⚠️  .env file not found');
        console.log('📋 Creating .env from example...');
        
        try {
            const examplePath = path.join(__dirname, '../.env.example');
            const exampleContent = await fs.readFile(examplePath, 'utf8');
            await fs.writeFile(envPath, exampleContent);
            console.log('✅ .env file created from example');
            console.log('📝 Please edit .env file with your database credentials');
        } catch (error) {
            console.log('❌ Failed to create .env file');
            console.log('📝 Please create .env file manually with database credentials');
        }
    }
}

// Main setup function
async function main() {
    console.log('🏗️  Date Night Database Setup\n');
    
    await checkEnvironment();
    console.log('');
    
    // Ask for confirmation
    console.log('⚠️  This will create/recreate the date_night_app database.');
    console.log('Press Ctrl+C to cancel, or Enter to continue...');
    
    // Wait for user input (simplified)
    process.stdin.resume();
    process.stdin.on('data', async () => {
        process.stdin.pause();
        await setupDatabase();
        process.exit(0);
    });
}

if (require.main === module) {
    main().catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}

module.exports = { setupDatabase };
