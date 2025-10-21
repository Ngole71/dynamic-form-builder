#!/bin/bash
# Quick setup script for Form Builder POC
# Run with: bash setup.sh

echo "🏗️  Setting up Form Builder POC..."

# Create project structure
echo "📁 Creating project directories..."
mkdir -p form-builder-poc/backend
mkdir -p form-builder-poc/frontend
cd form-builder-poc

echo "📦 Setting up backend..."
cd backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "form-builder-api",
  "version": "1.0.0",
  "description": "Dynamic Form Builder Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Create .env template
cat > .env << 'EOF'
# Form Builder API Environment Configuration
PORT=3000
NODE_ENV=development

# Database Configuration - UPDATE THESE VALUES
DB_HOST=localhost
DB_PORT=5432
DB_NAME=form_builder
DB_USER=postgres
DB_PASSWORD=your_password_here

# CORS Configuration
FRONTEND_URL=http://localhost:3001
EOF

echo "📦 Installing backend dependencies..."
npm install

echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update database credentials in backend/.env"
echo "2. Copy server.js file to backend/"
echo "3. Run database schema (database_schema.sql) in PostgreSQL"
echo "4. Copy the HTML frontend file to frontend/"
echo "5. Start backend: cd backend && npm start"
echo "6. Start frontend: cd frontend && python -m http.server 3001"
echo ""
echo "🌟 Your Form Builder POC will be ready at:"
echo "   Backend API: http://localhost:3000"
echo "   Frontend:    http://localhost:3001"