# 👥 Team Setup Guide

This guide helps new developers set up their development environment for the Dynamic Form Builder project.

## Security First!

### **1. Clone the Repository**
```bash
git clone https://github.com/ngole71/dynamic-form-builder.git
cd dynamic-form-builder
```

### **2. Setup Your Environment File**
```bash
cd backend

# Copy the template to create your personal .env file
cp .env.example .env

# Edit with YOUR credentials (use your preferred editor)
nano .env
# or
code .env
# or
vim .env
```

### **3. Install PostgreSQL**

#### **Option A: Local PostgreSQL Installation**

**macOS (using Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create your database user (optional)
createuser -s your_username
createdb -O your_username form_builder
```

**Ubuntu/Debian Linux:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Switch to postgres user and create your setup
sudo -u postgres psql
```

Then in PostgreSQL prompt:
```sql
CREATE USER your_username WITH PASSWORD 'your_secure_password';
ALTER USER your_username CREATEDB;
CREATE DATABASE form_builder OWNER your_username;
\q
```

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install using the wizard
3. Remember the password you set for the `postgres` user
4. Use pgAdmin to create your `form_builder` database

#### **Option B: Docker PostgreSQL (Recommended for Teams)**
```bash
# Create a local PostgreSQL container
docker run --name form-builder-db \
  -e POSTGRES_DB=form_builder \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

### **4. Configure Your Environment**
Edit `backend/.env` with YOUR specific credentials:

```env
# Your personal database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=form_builder
DB_USER=your_username          # ← Replace with YOUR username
DB_PASSWORD=your_password      # ← Replace with YOUR password

# These can stay the same for local development
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3002
```

### **5. Setup Database Schema**
```bash
# Navigate to backend directory
cd backend

# Create database and load schema
psql -U your_username -h localhost -d form_builder -f database_schema.sql

# If you get permission errors, try:
psql -U postgres -h localhost -d form_builder -f database_schema.sql
```

### **6. Install Dependencies and Start**
```bash
# Install backend dependencies
npm install

# Start the backend server
npm start
```

You should see:
```
Form Builder API running on port 3000
Health Check: GET http://localhost:3000/health
Master Questions: GET http://localhost:3000/api/master-questions
```

### **7. Start Frontend (New Terminal)**
```bash
# Navigate to frontend directory
cd frontend

# Start frontend server
python3 -m http.server 3002
```

### **8. Verify Everything Works**
```bash
# Test backend health
curl http://localhost:3000/health

# Test master questions API
curl http://localhost:3000/api/master-questions

# Open frontend in browser
open http://localhost:3002
```

## Development Workflow

### **Daily Development Routine**
```bash
# 1. Always pull latest changes first
git checkout main
git pull origin main

# 2. Check for new dependencies
cd backend
npm install

# 3. Check for database schema updates
# If database_schema.sql was updated, re-run it:
psql -U your_username -h localhost -d form_builder -f database_schema.sql

# 4. Start your development servers
npm start  # Backend (terminal 1)
cd ../frontend && python3 -m http.server 3002  # Frontend (terminal 2)
```

### **Creating New Features**
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... develop feature ...

# 3. Test your changes
# Test both frontend and backend

# 4. Commit changes (NEVER commit .env!)
git add .
git commit -m "Add your feature description"

# 5. Push and create Pull Request
git push origin feature/your-feature-name
```

## Environment Setup Options

### **Option 1: Local PostgreSQL (Most Common)**
```bash
# Pros: Full control, fast, persistent data
# Cons: Requires local installation

# macOS
brew install postgresql

# Ubuntu
sudo apt install postgresql

# Usage
createdb form_builder
psql -U postgres -d form_builder -f database_schema.sql
```

### **Option 2: Docker PostgreSQL (Team Consistency)**
```bash
# Pros: Same environment for everyone, easy cleanup
# Cons: Requires Docker knowledge

# Start container
docker run --name form-builder-db \
  -e POSTGRES_DB=form_builder \
  -e POSTGRES_USER=devuser \
  -e POSTGRES_PASSWORD=devpass123 \
  -p 5432:5432 \
  -d postgres:15

# Connect and load schema
docker exec -i form-builder-db psql -U devuser -d form_builder < backend/database_schema.sql

# Your .env would use:
# DB_USER=devuser
# DB_PASSWORD=devpass123
```

### **Option 3: Cloud Database (Shared Staging)**
Use services like:
- **AWS RDS** (PostgreSQL)
- **Google Cloud SQL**
- **Heroku Postgres**
- **Supabase** (free tier available)

## 📁 Project Structure

```
dynamic-form-builder/
├── .gitignore              # ← Git ignore rules (excludes .env)
├── README.md               # ← Main project documentation
├── TEAM_SETUP.md          # ← This file (team guide)
├── backend/
│   ├── .env.example        # ← Template (committed to Git)
│   ├── .env                # ← Your secrets (NOT in Git)
│   ├── package.json        # ← Dependencies
│   ├── server.js           # ← API server
│   └── database_schema.sql # ← Database setup
├── frontend/
│   └── index.html          # ← Form builder interface
└── setup_script.sh         # ← Automated setup script
```

## Security Best Practices

### **Individual Developer Guidelines:**
1. **Use strong, unique passwords** for your local database
2. **Never share your .env file** contents
3. **Keep your local .env file secure** (not in cloud folders)
4. **Use different passwords** for different environments
5. **Report any accidental commits** of sensitive data immediately

### **Team Lead Guidelines:**
1. **Review all commits** for accidentally committed secrets
2. **Use secrets management** for staging/production (AWS Secrets Manager, etc.)
3. **Regular security training** for the team
4. **Implement pre-commit hooks** to prevent .env commits
5. **Monitor for credential leaks** in commit history

## Common Issues & Solutions

### **"ECONNREFUSED" - Connection Refused Error**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list | grep postgres
brew services start postgresql

# Linux:
sudo systemctl status postgresql
sudo systemctl start postgresql

# Docker:
docker ps
docker start form-builder-db
```

### **"password authentication failed" Error**
```bash
# Check your .env file credentials
cat backend/.env

# Test connection manually