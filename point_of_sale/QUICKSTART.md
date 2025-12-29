# Quick Start Guide - POS Sanitary Store

## 🚀 Quick Installation (Windows)

### Step 1: Install Prerequisites

1. **Install Node.js** (if not installed)
   - Download from: https://nodejs.org/
   - Verify: Open PowerShell and run `node --version`

2. **Install MongoDB** (if not installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Step 2: Start MongoDB

**Option A: Local MongoDB**
```powershell
# Start MongoDB service
net start MongoDB
```

**Option B: MongoDB Atlas**
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string
- Update backend/.env with your connection string

### Step 3: Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start backend server
npm run dev
```

Backend will run on: http://localhost:5000

### Step 4: Setup Frontend

```powershell
# Open new PowerShell terminal
# Navigate to frontend folder
cd vite-project

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### Step 5: Create Admin User

**Option 1: Register via Frontend**
1. Go to http://localhost:5173
2. Click Register (if available) or use API

**Option 2: Use API Tool (Thunder Client/Postman)**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@pos.com",
  "password": "admin123",
  "role": "admin"
}
```

### Step 6: Login

1. Go to http://localhost:5173
2. Use credentials:
   - Email: admin@pos.com
   - Password: admin123

## 📁 Folder Structure

```
point_of_sale/
├── backend/           # Node.js Express API
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth & logging
│   └── server.js     # Main server file
│
└── vite-project/     # React Frontend
    ├── src/
    │   ├── pages/    # All page components
    │   ├── components/ # Reusable components
    │   ├── services/ # API services
    │   └── context/  # React context
    └── package.json
```

## 🎯 Features Overview

### ✅ Completed Features

1. **Authentication & Authorization**
   - Login/Logout
   - Role-based access (Admin, Manager, Cashier)
   - JWT token authentication

2. **Product Management**
   - Add, Edit, Delete products
   - Categories: Tiles, Cement, Jali, Sanitaryware, etc.
   - Stock tracking
   - Low stock alerts

3. **Sales Management**
   - Create new sales
   - Add multiple products to cart
   - Customer information
   - Multiple payment methods
   - Invoice generation

4. **Inventory Management**
   - Real-time stock updates
   - Inventory logs (all movements)
   - Stock value tracking
   - Category-wise inventory

5. **Dashboard**
   - Today's sales statistics
   - Monthly revenue
   - Top selling products
   - Sales trends (charts)
   - Low stock alerts
   - Recent activities

6. **Invoices**
   - Auto-generated invoice numbers
   - Invoice search
   - Payment status tracking

7. **Reports & Analytics**
   - Sales by category
   - Revenue charts
   - Date range filtering
   - Visual analytics (charts)

8. **Activity Logging**
   - All user actions logged
   - System audit trail
   - Admin/Manager access only

## 🔑 User Roles & Permissions

### Admin
- Full system access
- User management
- Delete products
- View all logs
- System settings

### Manager
- Product management
- Sales operations
- Inventory adjustments
- View logs
- Reports

### Cashier
- Create sales
- View products
- View invoices
- Basic operations

## 🛠️ Common Commands

### Backend Commands
```powershell
cd backend

# Install dependencies
npm install

# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

### Frontend Commands
```powershell
cd vite-project

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Backend (port 5000)
# Find process: netstat -ano | findstr :5000
# Kill process: taskkill /PID <PID> /F

# Frontend (port 5173)
# Usually auto-assigns new port
```

### MongoDB Connection Error
1. Check if MongoDB service is running
2. Verify connection string in backend/.env
3. Check firewall settings

### CORS Error
1. Ensure backend is running on port 5000
2. Verify VITE_API_URL in vite-project/.env
3. Check backend CORS configuration

### Module Not Found
```powershell
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

## 📝 Sample Data

### Add Sample Products (After Login)

1. **Tiles**
   - Name: Ceramic Floor Tile
   - SKU: TILE-001
   - Category: tiles
   - Unit: piece
   - Purchase Price: 50
   - Selling Price: 75
   - Stock: 100

2. **Cement**
   - Name: Portland Cement 50kg
   - SKU: CEM-001
   - Category: cement
   - Unit: bag
   - Purchase Price: 350
   - Selling Price: 450
   - Stock: 50

3. **Jali**
   - Name: Decorative Jali Panel
   - SKU: JALI-001
   - Category: jali
   - Unit: piece
   - Purchase Price: 200
   - Selling Price: 300
   - Stock: 30

## 🎨 Tech Stack

- **Frontend**: React 19, React Router, Axios, Recharts
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, Bcrypt
- **Styling**: Custom CSS with modern design
- **Charts**: Recharts library

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review error messages carefully
3. Ensure all prerequisites are installed
4. Verify environment variables
5. Check if both servers are running

## 🚀 Next Steps

1. Start both servers
2. Register/Login
3. Add products
4. Create your first sale
5. Explore dashboard and reports

---

**Happy Selling! 🛒**
