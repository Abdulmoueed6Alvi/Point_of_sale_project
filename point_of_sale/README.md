# POS Sanitary Store - Inventory Management System

A full-stack Point of Sale (POS) and Inventory Management System built with the MERN stack for sanitary items stores (tiles, cement, jali, sanitaryware, etc.).

## Features

### Core Functionality
- **User Authentication**: Secure login/logout with JWT tokens and role-based access control (Admin, Manager, Cashier)
- **Product Management**: Complete CRUD operations for products with categories, pricing, and stock levels
- **Sales Management**: Create sales, track invoices, process payments, and cancel/refund orders
- **Inventory Tracking**: Real-time stock updates, automatic inventory logs, low-stock alerts
- **Invoice Generation**: Auto-generated invoice numbers with complete transaction details
- **Dashboard Analytics**: Sales trends, top products, revenue statistics, and activity monitoring
- **Reporting**: Sales by category, revenue analysis, and custom date range reports
- **Activity Logging**: Comprehensive system activity logs for audit trails

### Technical Features
- **Real-time Inventory Updates**: Automatic stock adjustments on sales
- **Role-Based Access Control**: Different permissions for Admin, Manager, and Cashier
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **RESTful API**: Clean API architecture with proper error handling
- **Data Validation**: Both client-side and server-side validation
- **Secure Authentication**: Password hashing with bcrypt and JWT tokens

## Tech Stack

### Frontend
- **React 19**: Modern UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization and charts
- **Lucide React**: Beautiful icon library
- **Date-fns**: Date formatting and manipulation
- **Vite**: Fast build tool and dev server

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcryptjs**: Password hashing
- **Express Validator**: Request validation

## Project Structure

```
point_of_sale/
├── backend/                      # Node.js/Express backend
│   ├── models/                   # Mongoose models
│   │   ├── User.js              # User authentication model
│   │   ├── Product.js           # Product catalog model
│   │   ├── Sale.js              # Sales transaction model
│   │   ├── InventoryLog.js      # Inventory movement tracking
│   │   └── ActivityLog.js       # System activity logging
│   ├── routes/                   # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product management
│   │   ├── sales.js             # Sales operations
│   │   ├── inventory.js         # Inventory management
│   │   ├── invoices.js          # Invoice handling
│   │   ├── logs.js              # Activity logs
│   │   └── dashboard.js         # Dashboard statistics
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js              # Authentication middleware
│   │   └── logger.js            # Activity logging middleware
│   ├── server.js                 # Express server setup
│   ├── package.json              # Backend dependencies
│   └── .env                      # Environment variables
│
└── vite-project/                 # React frontend
    ├── src/
    │   ├── components/           # Reusable components
    │   │   ├── Layout.jsx       # Main layout with sidebar
    │   │   └── Layout.css
    │   ├── pages/                # Page components
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Dashboard.jsx    # Main dashboard
    │   │   ├── Products.jsx     # Product management
    │   │   ├── Sales.jsx        # Sales history
    │   │   ├── NewSale.jsx      # Create new sale
    │   │   ├── Inventory.jsx    # Inventory tracking
    │   │   ├── Invoices.jsx     # Invoice list
    │   │   ├── Reports.jsx      # Analytics and reports
    │   │   └── Settings.jsx     # System settings
    │   ├── context/              # React context
    │   │   └── AuthContext.jsx  # Authentication context
    │   ├── services/             # API services
    │   │   └── api.js           # Axios configuration and API calls
    │   ├── App.jsx               # Main app component
    │   ├── App.css               # Global styles
    │   └── main.jsx              # App entry point
    ├── package.json              # Frontend dependencies
    └── .env                      # Frontend environment variables
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd point_of_sale
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your settings:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_sanitary_store
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=development

# Start MongoDB (if running locally)
mongod

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd vite-project

# Install dependencies
npm install

# Configure environment variables
# Edit .env file:
VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Database Setup

### Create Default Admin User

After starting the backend server, you can register an admin user:

**Option 1: Using API (Postman/Thunder Client)**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@pos.com",
  "password": "admin123",
  "role": "admin"
}
```

**Option 2: Using MongoDB Shell**
```javascript
// Connect to MongoDB
use pos_sanitary_store

// Create admin user (password will be hashed on first login)
db.users.insertOne({
  name: "Admin User",
  email: "admin@pos.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Default Login Credentials

After registering, use these credentials to login:
- **Email**: admin@pos.com
- **Password**: admin123

## Usage Guide

### 1. Dashboard
- View today's and monthly sales statistics
- Monitor inventory levels and low-stock alerts
- Track top-selling products
- Review recent system activities

### 2. Product Management
- Add new products with details (name, SKU, category, pricing, stock)
- Update product information
- Track stock levels and set minimum thresholds
- Deactivate products (soft delete)

### 3. Sales Operations
- Create new sales by adding products to cart
- Enter customer details
- Select payment method
- Generate invoice automatically
- View sales history
- Cancel sales if needed (with inventory restoration)

### 4. Inventory Management
- View inventory summary by category
- Track all inventory movements
- Monitor stock value
- Get low-stock and out-of-stock alerts
- Manual inventory adjustments

### 5. Invoice Management
- View all invoices
- Search invoices by number or customer
- Track payment status

### 6. Reports & Analytics
- Sales trends and patterns
- Revenue by category
- Custom date range reports
- Visual charts and graphs

### 7. Settings & Logs
- View system activity logs (Admin/Manager only)
- Monitor user actions
- Track system changes
- Audit trail for compliance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Manager)
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/alerts/low-stock` - Get low stock products

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale (Admin/Manager)
- `POST /api/sales/:id/cancel` - Cancel sale (Admin/Manager)
- `GET /api/sales/stats/summary` - Get sales statistics

### Inventory
- `GET /api/inventory/logs` - Get inventory logs
- `POST /api/inventory/adjust` - Adjust inventory (Admin/Manager)
- `GET /api/inventory/summary` - Get inventory summary
- `GET /api/inventory/movements/:productId` - Get product movements

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `GET /api/invoices/number/:invoiceNumber` - Get invoice by number

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales-by-category` - Get sales by category

### Logs
- `GET /api/logs/activity` - Get activity logs (Admin/Manager)
- `GET /api/logs/activity/user/:userId` - Get user activity
- `GET /api/logs/activity/stats` - Get activity statistics

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Admin, Manager, Cashier roles
- **Input Validation**: Express-validator for data validation
- **CORS Protection**: Configured CORS policies
- **Error Handling**: Comprehensive error handling
- **Activity Logging**: All actions are logged for audit

## Production Deployment

### Backend Deployment (Example: Heroku/Railway)
1. Set environment variables
2. Ensure MongoDB is accessible
3. Build and deploy:
```bash
npm start
```

### Frontend Deployment (Example: Vercel/Netlify)
1. Update API URL in `.env`
2. Build the project:
```bash
npm run build
```
3. Deploy the `dist` folder

### Environment Variables for Production
```env
# Backend
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production

# Frontend
VITE_API_URL=your_production_api_url
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access and firewall settings

### CORS Errors
- Check backend CORS configuration
- Verify API URL in frontend `.env`

### Authentication Issues
- Clear browser localStorage
- Check JWT token expiration
- Verify user credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: your-email@example.com

## Future Enhancements

- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Advanced reporting with filters
- [ ] Barcode scanning
- [ ] Supplier management
- [ ] Purchase order management
- [ ] Customer loyalty program
- [ ] Mobile application

---

**Built with ❤️ using MERN Stack**
