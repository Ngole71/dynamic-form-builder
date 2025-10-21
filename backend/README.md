# Dynamic Form Builder

A powerful, flexible form builder system that allows users to create complex conditional forms with a visual interface, store them in PostgreSQL, and collect responses. Built with Node.js, Express, and vanilla JavaScript.

![Form Builder Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Quick Start

### **Prerequisites**
- Node.js 16+ and npm
- PostgreSQL 12+

### **1-Minute Setup**
```bash
# Clone and setup
git clone https://github.com/yourusername/dynamic-form-builder.git
cd dynamic-form-builder

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Database setup
psql -U postgres -c "CREATE DATABASE form_builder;"
psql -U postgres -d form_builder -f database_schema.sql

# Start backend
npm start

# Start frontend (new terminal)
cd ../frontend
python3 -m http.server 3002
```

**🎉 Open http://localhost:3002 and start building forms!**

## ✨ Features

### 🎯 **Core Functionality**
- **Visual Form Builder**: Drag-and-drop interface for building forms
- **Master Question Library**: Reusable question bank with tagging system
- **Conditional Logic**: Dynamic show/hide questions based on responses
- **Multi-Tenant Support**: Isolated forms and data per tenant
- **Real-Time Preview**: See forms as end users will experience them
- **Flexible Question Types**: Text, Number, Date, Radio, Multi-select, Checkbox

### 🔧 **Advanced Features**
- **Dynamic Options**: Add/edit options for any question on-the-fly
- **Nested Conditional Logic**: Unlimited levels of sub-questions
- **Form Versioning**: Track form changes and updates
- **Response Analytics**: Basic form performance tracking
- **JSON Export/Import**: Portable form definitions
- **Search & Filtering**: Find questions by text or tags

## Architecture
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Backend API   │ ◄────────► │   PostgreSQL    │
│                 │                  │                 │            │                 │
│ • Form Builder  │                  │ • Express.js    │            │ • Master Qs     │
│ • Preview       │                  │ • Route Handlers│            │ • Forms         │
│ • JSON Export   │                  │ • Validation    │            │ • Responses     │
└─────────────────┘                  └─────────────────┘            └─────────────────┘
```

## API Endpoints

### **Master Questions**
- `GET /api/master-questions` - Get question library
- `POST /api/master-questions` - Create new question

### **Forms Management**
- `GET /api/forms/:tenantId` - List tenant forms
- `POST /api/forms` - Create new form
- `PUT /api/forms/:tenantId/:formId` - Update form

### **Form Responses**
- `POST /api/forms/:tenantId/:formId/responses` - Submit response
- `GET /api/forms/:tenantId/:formId/responses` - Get responses

### **Health Check**
- `GET /health` - API status

## Usage Example

### **Building a Health Assessment Form**

1. **Browse Question Library**
   - Search for "health" or "medical" tags
   - Select "Do you smoke?" question

2. **Add Conditional Logic**
```
   Do you smoke?
   ├── Yes
   │   └── How many cigarettes per day?
   │       ├── <5 per day
   │       ├── 5-10 per day  
   │       ├── 10-20 per day
   │       └── >20 per day
   └── No
```

## 📁 Project Structure
```
dynamic-form-builder/
├── README.md                 # Main documentation
├── TEAM_SETUP.md            # Developer setup guide
├── .gitignore               # Git ignore rules
├── backend/
│   ├── .env.example         # Environment template
│   ├── server.js            # Express API server
│   ├── package.json         # Dependencies
│   └── database_schema.sql  # Database setup
├── frontend/
│   └── index.html          # Form builder interface
└── setup_script.sh         # Quick setup script
```

## Technology Stack

### **Backend**
- **Node.js 16+**: JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL 12+**: Primary database
- **pg**: PostgreSQL client for Node.js

### **Frontend**
- **Vanilla JavaScript**: No framework dependencies
- **HTML5 & CSS3**: Modern web standards
- **Responsive Design**: Mobile-first approach

## Configuration

### **Environment Variables**
Copy `backend/.env.example` to `backend/.env` and configure:
```env
# Server
PORT=3000
NODE_ENV=development

# Database (CHANGE THESE!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=form_builder
DB_USER=your_username
DB_PASSWORD=your_password

# Frontend
FRONTEND_URL=http://localhost:3002
```

## 👥 Team Development

### **For New Developers**
1. See [TEAM_SETUP.md](TEAM_SETUP.md) for detailed setup instructions
2. Each developer needs their own PostgreSQL instance
3. Copy `.env.example` to `.env` with your credentials
4. Never commit `.env` files (they're in `.gitignore`)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

