#!/bin/bash

echo "🚀 Date Night App - MySQL Setup"
echo "================================="
echo ""

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found. Please install MySQL first:"
    echo "   macOS: brew install mysql"
    echo "   Ubuntu: sudo apt install mysql-server"
    echo "   Windows: Download from https://dev.mysql.com/downloads/"
    exit 1
fi

echo "✅ MySQL found"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env created from example"
    echo "❗ Please edit .env file with your MySQL credentials before continuing"
    echo ""
    echo "Required changes in .env:"
    echo "  DB_PASSWORD=your_mysql_password"
    echo "  DB_USER=your_mysql_username (if not root)"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo ""
echo "🔨 Setting up database..."
echo "This will create the 'date_night_app' database and tables."
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Running database setup..."
    node scripts/setup-database.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Setup completed successfully!"
        echo ""
        echo "Next steps:"
        echo "  1. Start the server: npm start"
        echo "  2. Open http://localhost:3001"
        echo "  3. Check admin panel: http://localhost:3001/admin"
        echo ""
    else
        echo "❌ Setup failed. Check the error messages above."
        exit 1
    fi
else
    echo "Setup cancelled."
    exit 0
fi
