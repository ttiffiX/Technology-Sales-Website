# Technology Sales Website

A modern full-stack e-commerce platform for selling technology products online. Built with **React** frontend and
**Spring Boot** backend, featuring secure authentication, product management, shopping cart, and VNPay payment
integration.

**Live Demo**: Coming soon | **Documentation**: Coming soon



## Table of Contents

---

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Common Error Solutions](#common-error-solutions)
- [License](#license)
- [Learning Resources](#learning-resources)
- [Project Statistics](#project-statistics)

## Features

---

### Customer Features

#### Core E-Commerce Features
- **Product Browsing** - Browse and explore technology products with detailed information
- **Advanced Filtering** - Multi-level filtering by category, attributes, and specifications
- **Product Comparison** - Compare multiple products side-by-side for better decision making
- **Product Details** - View comprehensive product information with images and full specifications
- **Shopping Cart** - Full CRUD operations for cart items with real-time quantity management
- **Order Management** - Place orders, track order status, and view order history
- **Order History** - View detailed order information and order tracking status
- **Payment Integration** - VNPay payment gateway for secure online transactions

#### Account & Profile Management
- **User Profile** - Manage personal user information and account details
- **Address Management** - Save, manage, and set default delivery addresses
- **Email Management** - Verify and manage email addresses for account security
- **Change Password** - Securely update account password
- **Forgot Password** - Reset password through email verification
- **Email Verification** - OTP-based email verification for account security

#### System Features
- **Image Upload** - Cloudinary integration for product image uploads
- **Account Cleanup Scheduler** - Automatic system cleanup for unverified accounts
- **Payment Timeout Scheduler** - Automatic cancellation of pending/timeout payments

### Product Manager Features

#### Product Management
- **Product Management** - Full CRUD operations for product inventory
- **Product Category Management** - Full CRUD product categories
- **Product Attribute Groups** - Manage attribute groups for product categorization
- **Product Attributes** - Define and manage product attributes and specifications
- **Product Import** - Batch import products from Excel files
- **Product State Control** - Toggle product active/inactive status

#### Order Management
- **Order Processing** - View and manage all customer orders
- **Order Status Tracking** - Track order status counts and history

#### Access to Customer Features
- All customer features are available to Product Managers for testing and validation

### Admin Features

#### Dashboard & Analytics
- **Admin Dashboard** - View comprehensive sales metrics and analytics
- **Revenue Analytics** - Track total revenue, pending revenue, and revenue trends
- **Daily Revenue Report** - View daily revenue with charts and trends
- **Category Revenue** - Revenue breakdown by product category
- **Top Products Analysis** - Identify best-selling products with sales metrics
- **Payment Method Analysis** - Revenue breakdown by payment methods
- **Order Cancellation Rate** - Monitor order cancellation statistics

#### User Management
- **User Account Management** - View all user accounts and manage user information
- **User Role Assignment** - Assign and modify user roles (Customer, PM, Admin)
- **User Ban Management** - Ban or unban user accounts as needed
- **User Filtering** - Advanced filtering and search for user management

#### Access to All Features
- All customer and Product Manager features are available to Admin accounts

### Security Features

- **Secure Authentication** - JWT-based authentication with access tokens and refresh tokens
- **Token Refresh** - Automatic token refresh mechanism for seamless user sessions
- **Email Verification** - OTP-based email verification for account security
- **Role-Based Access Control (RBAC)** - Different permissions per user role (Customer, PM, Admin)
- **Request Validation** - Input validation for all API requests
- **Password Security** - Secure password hashing and change functionality

## ️Tech Stack

---

### Frontend

- **Framework**: React 18.3.1
- **Styling**: SASS/SCSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **UI Components**: Custom components
- **Charts**: Recharts (for analytics)
- **Notifications**: React Toastify
- **Drag & Drop**: @hello-pangea/dnd
- **Package Manager**: npm

### Backend

- **Framework**: Spring Boot 3.4.0
- **Language**: Java 22
- **Database**: PostgreSQL 12+
- **ORM**: Hibernate/JPA
- **Security**: Spring Security + JWT (JJWT)
- **Build Tool**: Maven
- **JSON Processing**: Gson, Lombok
- **Email**: Spring Mail
- **File Upload**: Cloudinary API
- **Payment**: VNPay Gateway
- **Caching**: Spring Cache with Caffeine
- **Validation**: Spring Validation

### Third-Party Services

- **VNPay**: Payment gateway (Vietnam)
- **Cloudinary**: Cloud file storage
- **Gmail SMTP**: Email service

## System Architecture

---

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Pages: Home, Product, Cart, Order, Profile, etc   │ │
│  │  Components: Header, Nav, ProductGrid, Modals...   │ │
│  │  Contexts: CartContext, CompareContext             │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↕ (REST/HTTP)                   │
├─────────────────────────────────────────────────────────┤
│                  Backend (Spring Boot)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Controllers: Auth, Product, Cart, Order, Payment   │ │
│  │ Services: Business logic for all features          │ │
│  │ Repositories: Data access layer (JPA)              │ │
│  │ Security: JWT Auth Filter, Role-based Access       │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↕ (JDBC)                        │
├─────────────────────────────────────────────────────────┤
│              Database (PostgreSQL)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Tables: Users, Products, Orders, Payments, etc     │ │
│  │ Schema: Normalized relational database design      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

External Services:
├── VNPay (Payment Gateway)
├── Cloudinary (Image Storage)
└── Gmail SMTP (Email Service)
```

## Project Structure

---

### Full Directory Tree

```
Technology-Sales-Website/
├── README.md                         # This file
├── Documents/                        # Project documentation
│   ├── SRS.docx                      # Software Requirements Specification
│   ├── ClassDiagram.png              # UML Class diagram
│   ├── Overall Use Case Diagram.png  # Use case diagram
│   ├── SalesTechWebDB.drawio.png     # Database diagram
│   ├── Activity Diagrams/            # UML Activity diagrams for each use case
│   └── Sequence Diagrams/            # UML Sequence diagrams
│
├── BE/                               # Backend (Spring Boot)
│   └── sale-tech-web/
│       ├── pom.xml                   # Maven dependencies
│       ├── mvnw / mvnw.cmd           # Maven wrapper
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/example/sale_tech_web/
│       │   │   │   ├── SaleTechWebApplication.java    # Main Spring Boot app
│       │   │   │   ├── config/                        # Configuration classes
│       │   │   │   │   ├── WebSecurityConfig.java     # Spring Security config
│       │   │   │   │   └── AuthTokenFilter.java       # JWT filter
│       │   │   │   ├── controller/                    # REST Controllers
│       │   │   │   │   ├── AuthController.java        # Authentication endpoints
│       │   │   │   │   ├── ProductController.java     # Product endpoints
│       │   │   │   │   ├── CartController.java        # Shopping cart endpoints
│       │   │   │   │   ├── OrderController.java       # Order endpoints
│       │   │   │   │   └── PaymentController.java     # Payment endpoints
│       │   │   │   ├── exception/                     # Exception handlers
│       │   │   │   │   ├── ErrorCode.java             # Error code
│       │   │   │   │   ├── ErrorResponse.java         # Error Response DTO
│       │   │   │   │   └── ExceptionController.java   # Exception handlers for all project
│       │   │   │   ├── feature/                       # Feature modules
│       │   │   │   │   ├── cart/                      # Shopping cart serivce
│       │   │   │   │   ├── cloudinary/                # Cloudinary serivce
│       │   │   │   │   ├── email/                     # Email serivce
│       │   │   │   │   ├── jwt/                       # JWT serivce
│       │   │   │   │   ├── order/                     # Order serivce
│       │   │   │   │   ├── payment/                   # Payment processing
│       │   │   │   │   ├── product/                   # Product serivce
│       │   │   │   │   ├── profile/                   # Profile service
│       │   │   │   │   ├── province/                  # Province data service
│       │   │   │   │   ├── revenue/                   # Revenue service
│       │   │   │   │   ├── user_address/              # User Address service
│       │   │   │   │   └── users/                     # User serivce
│       │   │   │   └── utils/                         # Utility classes
│       │   │   └── resources/
│       │   │       ├── application.properties         # Application config
│       │   │       ├── SalesTechWeb.sql              # Database schema (v1)
│       │   │       └── SalesTechWeb2.sql             # Database schema (v2)
│       │   └── test/
│       │       └── java/SaleTechWebApplicationTests.java
│       └── target/                   # Compiled classes (auto-generated)
│
└── FE/                                # Frontend (React)
    └── my-react-app/
        ├── package.json              # npm dependencies
        ├── public/
        │   ├── index.html            # HTML entry point
        │   ├── indexIcon.png         # Favicon
        │   ├── manifest.json         # PWA manifest
        │   └── robots.txt
        ├── src/
        │   ├── index.js              # React entry point
        │   ├── App.js                # Main React component
        │   ├── App.scss              # Global app styles
        │   ├── reportWebVitals.js    # Performance metrics
        │   ├── api/                  # API client layer
        │   │   ├── apiClient.js      # Axios configuration
        │   │   ├── AuthAPI.js        # Authentication endpoints
        │   │   ├── ProductAPI.js     # Product endpoints
        │   │   ├── CartAPI.js        # Cart endpoints
        │   │   ├── OrderAPI.js       # Order endpoints
        │   │   └── PaymentAPI.js     # Payment endpoints
        │   ├── assets/               # Static assets
        │   │   ├── icon/             # Icons
        │   │   └── images/           # Product/banner images
        │   ├── components/           # Reusable components
        │   │   ├── header/           # Header/navbar
        │   │   ├── navigation/       # Navigation menu
        │   │   ├── productgrid/      # Product listing grid
        │   │   ├── productdetail/    # Product detail card
        │   │   ├── cartgrid/         # Cart items display
        │   │   ├── filtersidebar/    # Advanced search/filter
        │   │   ├── searchbar/        # Search component
        │   │   ├── modal/            # Modal components
        │   │   ├── pagination/       # Pagination component
        │   │   ├── Toast/            # Notification component
        │   │   ├── Loading/          # Loading spinner
        │   │   └── comparebar/       # Product comparison bar
        │   ├── contexts/             # React context providers
        │   │   ├── CartContext.js    # Shopping cart state
        │   │   └── CompareContext.js # Product comparison state
        │   ├── pages/                # Page components
        │   │   ├── login/            # Login/Register pages
        │   │   ├── homepage/         # Home page
        │   │   ├── productdetail/    # Product detail page
        │   │   ├── cart/             # Shopping cart page
        │   │   ├── order/            # Checkout/place order page
        │   │   ├── orderhistory/     # Order history/details
        │   │   ├── profile/          # User profile page
        │   │   ├── admin/            # Admin dashboard pages
        │   │   ├── pm/               # Product Manager pages
        │   │   ├── customer/         # Customer-specific pages
        │   │   ├── paymentresult/    # Payment success/fail pages
        │   │   ├── verifyemail/      # Email verification page
        │   │   └── aboutme/          # About page
        │   ├── router/               # Routing configuration
        │   │   ├── RouterPages.js    # Main router setup
        │   │   ├── ProtectedRoute.js # Protected route wrapper
        │   │   ├── RoleProtectedRoute.js # Role-based route protection
        │   │   ├── AdminRoutes.js    # Admin routes
        │   │   ├── CustomerRoutes.js # Customer routes
        │   │   └── PMRoutes.js       # Product Manager routes
        │   ├── styles/               # Global SCSS
        │   │   ├── index.scss        # Main stylesheet
        │   │   ├── _variables.scss   # CSS variables/colors
        │   │   ├── _mixins.scss      # SCSS mixins
        │   │   └── _base.scss        # Base styles
        │   └── utils/                # Utility functions
        ├── build/                    # Production build (auto-generated)
        └── README.md                 # Frontend-specific docs
```

### Key Directories Explained

#### Backend (`BE/sale-tech-web/`)

- **config/**: Spring Security, JWT, security filters
- **controller/**: REST API endpoints
- **Exception/**: Error handling
- **feature/**: Business logic separated by feature (users, products, cart, orders, payments)
- **resources/**: Configuration files and SQL scripts

#### Frontend (`FE/my-react-app/`)

- **api/**: Centralized API client for backend communication
- **components/**: Reusable UI components
- **pages/**: Route page components with full features
- **contexts/**: Global state management (Cart, Compare products)
- **router/**: Navigation setup with role-based access control
- **utils/**: Helper functions for common operations

## Installation & Setup

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Technology-Sales-Website.git
cd Technology-Sales-Website
```

### Step 2: Backend Setup

#### 2.1 Install Java and Maven

```bash
# Verify Java installation
java -version  # Should be 17 or higher

# Verify Maven installation
mvn -version   # Should be 3.6 or higher
```

#### 2.2 Install Backend Dependencies

```bash
cd BE/sale-tech-web
mvn clean install
```

#### 2.3 Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE salestech_db;
GRANT ALL PRIVILEGES ON DATABASE salestech_db TO postgres;

# Exit psql
\q
```

#### 2.4 Import Database Schema

```bash
# Using psql (recommended)
psql -U postgres -d salestech_db -f src/main/resources/SalesTechWeb2.sql

# Or using pgAdmin if you prefer GUI
```

### Step 3: Frontend Setup

#### 3.1 Install Node.js and npm

```bash
# Verify installations
node --version   # Should be 16 or higher
npm --version    # Should be 8 or higher
```

#### 3.2 Install Frontend Dependencies

```bash
cd FE/my-react-app
npm install
```

## Configuration

---

### Backend Configuration

#### 3.1 Create `.env` File

Create `BE/sale-tech-web/.env` file (`BE/sale-tech-web/.evn.example` for example):

```properties
# ========== Database Configuration ==========
DB_URL=jdbc:postgresql://localhost:5432/salestech_db
DB_USER=postgres
DB_PASS=your_postgres_password
# ========== JWT Configuration ==========
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_EXPIRATION=your_app_expiration_access_token
JWT_REFRESH_EXPIRATION=your_app_expiration_refresh_token
# ========== VNPay Configuration (Payment) ==========
VNPAY_TMN_CODE=your_vnpay_terminal_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_RETURN_URL=http://localhost:3000/payment-result
VNPAY_IPN_URL=http://localhost:8080/api/payment/vnpay-ipn
# ========== Email Configuration ==========
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
# ========== Cloudinary Configuration (Image Upload) ==========
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 3.2 Generate JWT Secret (for security)

```bash
# Generate a strong JWT secret (Linux/Mac)
openssl rand -base64 32

# Or use online tool: https://www.randomkeygen.com/
```

#### 3.3 VNPay Setup (Payment Integration)

1. Register account at [VNPay](https://sandbox.vnpayment.vn/)
2. Get TMN Code and Hash Secret from VNPay merchant portal
3. Add credentials to `.env` file

#### 3.4 Cloudinary Setup (Image Upload)

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env` file

#### 3.5 Gmail App Password (Email Service)

1. Enable 2-factor authentication on Gmail account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app-specific password
4. Set `EMAIL_PASSWORD` to this app password in `.env`

## Running the Application

---

### Start PostgreSQL Database

```bash
# Windows (if using pgAdmin)
# Open pgAdmin and ensure PostgreSQL is running

# Or via command line (macOS/Linux)
brew services start postgresql

# Or (Windows with PostgreSQL service)
net start postgresql-x64-15
```

### Start Backend Server

#### Option 1: Using Maven

```bash
cd BE/sale-tech-web
mvnw spring-boot:run
```

#### Option 2: Using Java

```bash
cd BE/sale-tech-web
mvnw clean package
java -jar target/sale-tech-web-0.0.1-SNAPSHOT.jar
```

**Backend will run at**: `http://localhost:8080`

Verify backend is running:

```bash
curl http://localhost:8080/api/products
```

### Start Frontend Server

```bash
cd FE/my-react-app
npm start
```

Frontend will run at: `http://localhost:3000`

## API Documentation

---

### Base URL

```
http://localhost:8080
```

### Authentication (`/auth`)

```http
POST  /auth/login                   # Login
POST  /auth/refresh-token           # Refresh access token using refresh cookie
POST  /auth/logout                  # Logout and clear refresh cookie
POST  /auth/register                # Register new user
PATCH /auth/change-password         # Change password
POST  /auth/verify-email            # Verify email with OTP
POST  /auth/resend-verification     # Resend verification email (?email=)
POST  /auth/forgot-password         # Send forgot-password OTP (?email=)
POST  /auth/verify-reset-otp        # Verify reset OTP
POST  /auth/reset-password          # Reset password with reset token
```

### Cart (`/cart`)

```http
GET    /cart                        # Get current user's cart
GET    /cart/total-quantity         # Get total selected quantity
POST   /cart                        # Add product to cart
PATCH  /cart                        # Change product quantity
DELETE /cart                        # Remove product from cart
PATCH  /cart/toggle-selection       # Toggle one product selection
PATCH  /cart/toggle-all             # Toggle all product selection
```

### Orders (`/orders`)

```http
GET    /orders                      # Get paged orders for current user
GET    /orders/{orderId}            # Get order details
GET    /orders/status-count         # Get order count by status
POST   /orders                      # Place order
PATCH  /orders/{orderId}/cancel     # Cancel order
```

### Payment (`/payment`)

```http
GET /payment/vnpay/callback         # VNPay return callback
GET /payment/vnpay/ipn              # VNPay IPN notification
```

### Product Catalog (`/product`)

```http
GET    /product                     # Get top 10 products by category
GET    /product/{id}                # Get product detail
GET    /product/categories          # Get all categories
GET    /product/category/{categoryId} # Get products by category
GET    /product/filter-options      # Get filter options (?categoryId=)
GET    /product/filter              # Unified search/filter endpoint
POST   /product/compare             # Compare multiple products
```

### Profile (`/profile`)

```http
GET  /profile                       # Get current user's profile
PUT  /profile                       # Update profile
```

### Province (`/province`)

```http
GET /province                       # Get all provinces
GET /province/{provinceCode}/wards   # Get wards by province code
```

### Address (`/address`)

```http
GET    /address                     # Get all addresses
GET    /address/{id}                # Get address by id
POST   /address                     # Create address
PUT    /address/{id}                # Update address
DELETE /address/{id}                # Delete address
PATCH  /address/{id}/set-default    # Set default address
```

### Admin (`/admin`)

```http
GET    /admin/users                 # Get users with filters/pagination
GET    /admin/roles                 # Get all roles
POST   /admin/users                 # Create user
PATCH  /admin/users/{id}/role       # Update user role
DELETE /admin/users/{id}            # Delete user
PATCH  /admin/users/{id}/ban        # Update ban status (?status=)
```

### Admin Revenue (`/admin/revenue`)

```http
GET /admin/revenue/total            # Total revenue
GET /admin/revenue/pending          # Pending revenue
GET /admin/revenue/cancel-rate      # Cancel rate
GET /admin/revenue/daily            # Daily revenue chart (?date=)
GET /admin/revenue/category         # Revenue by category
GET /admin/revenue/top-products     # Top products
GET /admin/revenue/payment-method   # Revenue by payment method
```

### Product Manager Orders (`/pm/orders`)

```http
GET    /pm/orders                   # Get orders for PM
GET    /pm/orders/{orderId}         # Get order details
GET    /pm/orders/status-count      # Get order count by status
PATCH  /pm/orders/{orderId}/approve # Approve order
PATCH  /pm/orders/{orderId}/reject  # Reject order (?reason=)
PATCH  /pm/orders/{orderId}/shipping # Move order to shipping
PATCH  /pm/orders/{orderId}/complete # Complete order
```

### Product Manager Products (`/pm/products`)

```http
GET    /pm/products                           # Get all products for PM
GET    /pm/products/{productId}               # Get product detail
POST   /pm/products                           # Add product (multipart form-data)
POST   /pm/products/category/{categoryId}/import # Import products from Excel
PUT    /pm/products/{productId}               # Update product (multipart form-data)
PATCH  /pm/products/{productId}/state         # Toggle product active state (?active=)
DELETE /pm/products/{productId}               # Delete product
```

### Product Manager Categories (`/pm/category`)

```http
POST   /pm/category?name=           # Add category
PUT    /pm/category/{categoryId}    # Update category (?name=)
DELETE /pm/category/{categoryId}    # Delete category
```

### Product Manager Attribute Groups (`/pm/attribute-groups`)

```http
GET    /pm/attribute-groups/category/{categoryId}          # Get groups by category
POST   /pm/attribute-groups                                 # Create attribute group
PUT    /pm/attribute-groups/{groupId}                       # Update attribute group
PATCH  /pm/attribute-groups/category/{categoryId}/reorder   # Reorder groups
DELETE /pm/attribute-groups/{groupId}                       # Delete attribute group
```

### Product Manager Category Attributes (`/pm/category-attributes`)

```http
GET    /pm/category-attributes/category/{categoryId}              # Get attributes by category
GET    /pm/category-attributes/category/{categoryId}/schemas      # Get category attribute schemas
POST   /pm/category-attributes/category/{categoryId}              # Add attribute schema
PUT    /pm/category-attributes/{attributeId}                      # Update attribute schema
PATCH  /pm/category-attributes/{groupId}/reorder                  # Reorder attributes in a group
DELETE /pm/category-attributes/{attributeId}                      # Delete attribute schema
```

### Endpoint Summary

- **Total documented endpoints**: 80
- Covers customer, admin, and product manager APIs

## Common Error Solutions

---

| Error                        | Solution                              |
|------------------------------|---------------------------------------|
| `Connection refused on 5432` | Start PostgreSQL service              |
| `Product image not loading`  | Check Cloudinary credentials          |
| `Email not sending`          | Verify Gmail app password, enable 2FA |
| `VNPay payment failed`       | Check VNPay credentials in .env       |
| `404 Not Found API`          | Verify backend is running on 8080     |

## License

---

This project is private and for educational purposes.

## Learning Resources

---

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [VNPay Documentation](https://sandbox.vnpayment.vn/)
- [JWT Guide](https://jwt.io/)

## Project Statistics

---

| Metric            | Value              |
|-------------------|--------------------|
| Frontend Language | JavaScript (React) |
| Backend Language  | Java               |
| Database          | PostgreSQL         |
| Total Endpoints   | 80                 |
| Tables            | 13                 |
| Deployment Ready  | Yes                |

---

**Last Updated**: May 2026  
**Version**: 1.0.0  
**Status**: Active Development

