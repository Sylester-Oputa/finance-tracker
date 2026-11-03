# 💰 LukaTech Finance Tracker

> **A comprehensive, enterprise-grade personal finance management application with advanced features, beautiful theming, and robust security.**

A modern, full-stack web application that empowers users to take complete control of their financial life. Built with cutting-edge technologies, featuring a beautiful dark/light theme system, comprehensive budgeting tools, goal tracking, and intelligent financial insights.

---

## 🌟 **Live Demo**

🔗 **[Finance Tracker - Live Application](https://finance-tracker-blue-nine.vercel.app)**  
🔗 **[API Documentation](https://www.postman.com/silive/my-workspace/collection/sxsq02i/expense-tracker?action=share&creator=30996501)**

**Demo Credentials:**
- Email: `soputa42@gmail.com`
- Password: `1234567890`

---

## 🚀 **Key Features**

### 💳 **Financial Management**
- ✅ **Income & Expense Tracking** - Add, edit, and categorize transactions with custom emoji icons
- ✅ **Budget Management** - Set monthly/weekly budgets with real-time usage tracking and alerts
- ✅ **Goal Setting** - Create savings goals with progress tracking and completion rewards
- ✅ **Bill Reminders** - Never miss a payment with smart reminder notifications
- ✅ **Financial Analytics** - Comprehensive charts and insights using Recharts
- ✅ **Excel Export** - Download detailed financial reports in Excel format
- ✅ **Multi-Currency Support** - Support for NGN, USD, EUR, GBP, and JPY

### 🔐 **Security & Authentication**
- ✅ **Secure JWT Authentication** - 24-hour access tokens with refresh token rotation
- ✅ **Email Verification** - Professional email templates with LukaTech branding
- ✅ **Password Reset** - Secure password recovery with token expiration
- ✅ **Session Management** - Track and manage active sessions across devices
- ✅ **Account Security** - Login attempt limiting and account suspension protection
- ✅ **Audit Logging** - Complete activity tracking for security compliance

### 🎨 **User Experience**
- ✅ **Dark/Light Theme** - Beautiful theme system with smooth transitions
- ✅ **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ✅ **Emoji Integration** - Full emoji picker with custom icons for transactions
- ✅ **Interactive Animations** - Smooth transitions powered by Framer Motion
- ✅ **Error Boundaries** - Graceful error handling with user-friendly fallbacks
- ✅ **Toast Notifications** - Real-time feedback for all user actions
- ✅ **Professional Branding** - LukaTech logo and consistent brand identity

### 📊 **Dashboard & Analytics**
- ✅ **Comprehensive Dashboard** - Real-time financial overview with key metrics
- ✅ **Category Breakdown** - Visual spending analysis by category
- ✅ **Trend Analysis** - Historical data visualization and spending patterns
- ✅ **Budget Alerts** - Smart notifications for budget limits and overspending
- ✅ **Goal Progress** - Visual progress tracking for savings goals
- ✅ **Recent Activity** - Timeline of recent transactions and activities

---

## 🛠 **Technology Stack**

### 🚧 **Frontend (React 18 + Vite)**
```json
{
  "core": {
    "React": "18.3.1",
    "Vite": "7.0.4",
    "React Router DOM": "7.6.3"
  },
  "styling": {
    "Tailwind CSS": "4.1.11",
    "Framer Motion": "12.23.6",
    "CSS Custom Properties": "Theme System"
  },
  "components": {
    "React Icons": "5.5.0",
    "Emoji Mart React": "1.1.1",
    "React Hot Toast": "2.5.2"
  },
  "charts": {
    "Recharts": "3.1.0"
  },
  "utilities": {
    "Axios": "1.10.0",
    "Moment.js": "2.30.1"
  }
}
```

### ⚙️ **Backend (Node.js + Express + Prisma)**
```json
{
  "core": {
    "Node.js": "Latest",
    "Express": "4.21.2",
    "Prisma ORM": "6.15.0"
  },
  "database": {
    "PostgreSQL": "Latest",
    "Prisma Client": "6.15.0"
  },
  "authentication": {
    "jsonwebtoken": "9.0.2",
    "bcryptjs": "3.0.2"
  },
  "email": {
    "Nodemailer": "7.0.5",
    "HTML Templates": "Custom LukaTech Branded"
  },
  "security": {
    "Express Rate Limit": "8.1.0",
    "Express Validator": "7.2.1",
    "CORS": "2.8.5"
  },
  "utilities": {
    "Winston": "3.17.0",
    "Node Cron": "4.2.1",
    "ExcelJS": "4.4.0",
    "Multer": "2.0.2"
  }
}
```

### 🗄️ **Database Schema**
```prisma
// Core Models
- User (Authentication, Profile, Settings)
- Income (Source tracking with categories)
- Expense (Category-based expense tracking)
- Budget (Monthly/Weekly budget management)
- Goal (Savings goals with progress tracking)
- Reminder (Bill reminders and notifications)
- Session (Security and device management)
- AuditLog (Activity tracking and compliance)
```

---

## 🏗️ **Application Architecture**

### 📂 **Frontend Structure**
```
src/
├── components/           # Reusable UI components
│   ├── layouts/         # Page layouts (Auth, Dashboard)
│   ├── Dashboard/       # Dashboard-specific components
│   ├── Charts/          # Data visualization components
│   ├── Cards/           # Information display cards
│   └── Inputs/          # Form input components
├── pages/               # Route-based page components
│   ├── Auth/            # Authentication pages
│   └── Dashboard/       # Protected dashboard pages
├── context/             # React Context providers
│   ├── UserContext.jsx  # User state management
│   ├── ThemeContext.jsx # Theme system management
│   └── DashboardContext.jsx # Dashboard data management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and helpers
└── assets/              # Static assets and images
```

### 🔧 **Backend Structure**
```
backend/
├── controllers/         # Business logic handlers
│   ├── authController.js       # Authentication & user management
│   ├── dashboardController.js  # Dashboard data aggregation
│   ├── expenseController.js    # Expense management
│   └── incomeController.js     # Income management
├── middleware/          # Express middleware
│   ├── authMiddleware.js       # JWT authentication
│   └── uploadMiddleware.js     # File upload handling
├── routes/              # API route definitions
├── utils/               # Utility services
│   ├── notificationService.js  # Email notifications
│   ├── auditLogger.js          # Activity logging
│   └── cronTasks.js            # Scheduled tasks
├── prisma/              # Database schema and migrations
└── uploads/             # File storage directory
```

---

## 🔒 **Security Features**

### 🛡️ **Authentication & Authorization**
- **JWT Token System**: 24-hour access tokens with 30-day refresh tokens
- **Session Management**: Database-tracked sessions with device information
- **Email Verification**: Mandatory email verification with professional templates
- **Password Security**: bcrypt hashing with salt rounds and complexity requirements
- **Rate Limiting**: API endpoint protection against brute force attacks
- **Account Protection**: Login attempt limiting and temporary account suspension

### 🔐 **Data Protection**
- **Input Validation**: Express Validator for all API endpoints
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Restricted cross-origin requests
- **Environment Variables**: Secure configuration management
- **Audit Logging**: Complete activity tracking for compliance

---

## 📧 **Email System**

### 📬 **Professional Email Templates**
- **Welcome Email**: Onboarding with feature highlights
- **Email Verification**: Account activation with 24-hour token expiry
- **Password Reset**: Secure password recovery with 1-hour token expiry
- **Login Notifications**: Security alerts for new device logins
- **Account Alerts**: Suspension and security notifications
- **LukaTech Branding**: Professional logo and consistent design

### 🎨 **Email Features**
- **Responsive Design**: Mobile-optimized email templates
- **Dark/Light Themes**: Consistent with application theming
- **Professional Styling**: Corporate-grade email design
- **Security Tips**: Educational content for user security
- **Call-to-Action Buttons**: Clear navigation and next steps

---

## 🎨 **Theme System**

### 🌓 **Dynamic Theming**
```css
/* CSS Custom Properties for Theme Management */
:root {
  /* Light Theme */
  --color-primary: #935F4C;
  --color-background: #FDFBF3;
  --color-cardBackground: #FFFFFF;
  --color-textPrimary: #181821;
  --color-textSecondary: #6B7280;
}

[data-theme="dark"] {
  /* Dark Theme */
  --color-primary: #A86D59;
  --color-background: #0F0F11;
  --color-cardBackground: #1A1A1E;
  --color-textPrimary: #FFFFFF;
  --color-textSecondary: #9CA3AF;
}
```

### 🎯 **Theme Features**
- **System Preference Detection**: Automatic theme selection based on OS settings
- **Local Storage Persistence**: Remember user theme preference
- **Smooth Transitions**: Animated theme switching across all components
- **Consistent Colors**: Unified color system across entire application
- **Component Theming**: All components support both light and dark modes

---

## 📊 **Financial Features**

### 💰 **Budget Management**
- **Period-based Budgets**: Weekly, monthly, and yearly budget cycles
- **Category Tracking**: Budget allocation by expense categories
- **Real-time Monitoring**: Live budget usage with percentage tracking
- **Alert System**: Notifications at 80% and 100% budget usage
- **Analytics Dashboard**: Visual budget performance with charts

### 🎯 **Goal Tracking**
- **Savings Goals**: Set target amounts with deadline tracking
- **Progress Visualization**: Visual progress bars and completion status
- **Milestone Rewards**: Celebration animations for goal completion
- **Goal Analytics**: Historical goal performance and achievement rates

### 📱 **Bill Reminders**
- **Smart Notifications**: Upcoming bill alerts with customizable timing
- **Payment Tracking**: Mark bills as paid with confirmation
- **Recurring Reminders**: Automatic monthly/weekly reminder generation
- **Overdue Alerts**: Escalated notifications for missed payments

### 📈 **Analytics & Reporting**
- **Spending Trends**: Historical spending analysis with trend lines
- **Category Breakdown**: Pie charts showing expense distribution
- **Income vs Expense**: Comparative analysis with net worth calculation
- **Excel Export**: Detailed financial reports for external analysis
- **Date Range Filtering**: Custom period analysis and comparison

---

## 🚀 **Getting Started**

### 📋 **Prerequisites**
```bash
# Required Software
Node.js >= 18.0.0
PostgreSQL >= 13.0
npm >= 8.0.0
Git
```

### ⚙️ **Installation**

1. **Clone the Repository**
```bash
git clone https://github.com/Sylester-Oputa/finance-tracker.git
cd finance-tracker
```

2. **Backend Setup**
```bash
cd backend
npm install

# Database Setup
npx prisma generate
npx prisma migrate deploy

# Environment Configuration
cp .env.example .env
# Configure your environment variables
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Environment Configuration
cp .env.example .env
# Configure your API endpoints
```

### 🔧 **Environment Variables**

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finance_tracker"

# JWT Secrets
JWT_SECRET="your-super-secure-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"

# Email Configuration (SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="LukaTech Finance Tracker <noreply@lukatech.com>"

# Application URLs
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:5500"

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PATH="./uploads"
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL="http://localhost:5500"
VITE_APP_NAME="LukaTech Finance Tracker"

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=false
```

### 🏃‍♂️ **Running the Application**

1. **Start Backend Server**
```bash
cd backend
npm start
# Server running on http://localhost:5500
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
# Application running on http://localhost:5173
```

3. **Access the Application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5500`
- Database: PostgreSQL on configured port

---

## 🚀 **Deployment**

### 🌐 **Production Deployment**

#### Frontend (Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

#### Backend (Render/Railway)
```bash
# Production build
npm run build

# Database migration
npx prisma migrate deploy

# Start production server
npm start
```

### 🔧 **Production Environment**
```env
# Production Settings
NODE_ENV=production
PORT=5500

# Secure Database URL
DATABASE_URL="postgresql://prod-user:secure-password@prod-host:5432/finance_tracker_prod"

# Production CORS
FRONTEND_URL="https://your-domain.com"

# Email Configuration
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT=587
```

---

## 🤝 **Contributing**

### 📝 **Development Guidelines**
1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### 📏 **Code Standards**
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Node.js best practices
- **Database**: Prisma schema conventions
- **Security**: OWASP guidelines compliance
- **Documentation**: JSDoc for all functions

---

## 👥 **Team**

### 🚀 **LukaTech Development Team**
- **Lead Developer**: [Sylvester Oputa](https://github.com/Sylester-Oputa)
- **UI/UX Designer**: LukaTech Design Team
- **Security Consultant**: LukaTech Security Team

---

**Built with ❤️ by [LukaTech](https://github.com/Sylester-Oputa) | Empowering Financial Freedom Through Technology**
