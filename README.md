# Technology Sales Website

A full-stack e-commerce application that allows users to shop for technology products online.

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)

## Overview

Technology Sales Website is a modern e-commerce platform built with a separated Frontend and Backend architecture. The system provides a complete online shopping experience with product management, shopping cart, payment processing, and order management features.

## Technologies

### Frontend
- React
- SASS

### Backend
- Spring Boot
- PostgreSQL

### Payment Gateway
- VNPay

## Project Structure

### Backend Structure

```
BE/sale-tech-web/
├── src/
│   ├── main/
│   │   ├── java/com/example/sale_tech_web/
│   │   │   ├── SaleTechWebApplication.java
│   │   │   ├── config/
│   │   │   │   ├── AuthTokenFilter.java
│   │   │   │   └── WebSecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CartController.java
│   │   │   │   ├── OrderController.java
│   │   │   │   ├── PaymentController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── ErrorResponse.java
│   │   │   │   │   └── ExceptionController.java
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── feature/
│   │   │   │   ├── cart/
│   │   │   │   │   ├── config/
│   │   │   │   │   │   └── CartConfig.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── CartDetailDTO.java
│   │   │   │   │   │   └── CartDTO.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Cart.java
│   │   │   │   │   │   └── CartDetail.java
│   │   │   │   │   ├── manager/
│   │   │   │   │   │   ├── CartService.java
│   │   │   │   │   │   └── CartServiceInterface.java
│   │   │   │   │   └── repository/
│   │   │   │   │       ├── CartDetailRepository.java
│   │   │   │   │       └── CartRepository.java
│   │   │   │   ├── email/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── EmailVerificationToken.java
│   │   │   │   │   ├── manager/
│   │   │   │   │   │   └── EmailService.java
│   │   │   │   │   └── repository/
│   │   │   │   │       └── EmailVerificationTokenRepository.java
│   │   │   │   ├── jwt/
│   │   │   │   │   ├── JwtUtils.java
│   │   │   │   │   └── SecurityUtils.java
│   │   │   │   ├── order/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── OrderDetailDTO.java
│   │   │   │   │   │   ├── OrderDTO.java
│   │   │   │   │   │   ├── OrderResponse.java
│   │   │   │   │   │   └── PlaceOrderRequest.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── orderdetails/
│   │   │   │   │   │   │   └── OrderDetail.java
│   │   │   │   │   │   └── orders/
│   │   │   │   │   │       └── Order.java
│   │   │   │   │   ├── enums/
│   │   │   │   │   │   └── OrderStatus.java
│   │   │   │   │   ├── manager/
│   │   │   │   │   │   ├── OrderService.java
│   │   │   │   │   │   └── OrderServiceInterface.java
│   │   │   │   │   └── repository/
│   │   │   │   │       ├── OrderDetailRepository.java
│   │   │   │   │       └── OrderRepository.java
│   │   │   │   ├── payment/
│   │   │   │   │   ├── config/
│   │   │   │   │   │   ├── PaymentConfig.java
│   │   │   │   │   │   └── VNPayConfig.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── VNPayPaymentResponse.java
│   │   │   │   │   │   ├── VNPayRefundRequest.java
│   │   │   │   │   │   └── VNPayRefundResponse.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── Payment.java
│   │   │   │   │   ├── enums/
│   │   │   │   │   │   ├── PaymentMethod.java
│   │   │   │   │   │   └── PaymentStatus.java
│   │   │   │   │   ├── manager/
│   │   │   │   │   │   ├── PaymentService.java
│   │   │   │   │   │   └── PaymentServiceInterface.java
│   │   │   │   │   ├── processor/
│   │   │   │   │   │   ├── CashPaymentProcessor.java
│   │   │   │   │   │   ├── PaymentProcessor.java
│   │   │   │   │   │   └── VNPayPaymentProcessor.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── PaymentRepository.java
│   │   │   │   │   ├── scheduler/
│   │   │   │   │   │   └── PaymentTimeoutScheduler.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── PaymentProcessingService.java
│   │   │   │   │   │   └── VNPayService.java
│   │   │   │   │   └── util/
│   │   │   │   │       └── VNPayUtil.java
│   │   │   │   ├── product/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── AdvancedFilterRequest.java
│   │   │   │   │   │   ├── CategoryDTO.java
│   │   │   │   │   │   ├── CategoryFilterOptionsDTO.java
│   │   │   │   │   │   ├── FilterAttributeDTO.java
│   │   │   │   │   │   ├── ProductDetailDTO.java
│   │   │   │   │   │   └── ProductListDTO.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Category.java
│   │   │   │   │   │   ├── CategoryAttributeMapping.java
│   │   │   │   │   │   ├── Product.java
│   │   │   │   │   │   ├── ProductAttribute.java
│   │   │   │   │   │   └── ProductAttributeValue.java
│   │   │   │   │   ├── manager/
│   │   │   │   │   │   ├── ProductService.java
│   │   │   │   │   │   └── ProductServiceInterface.java
│   │   │   │   │   └── repository/
│   │   │   │   │       ├── CategoryAttributeMappingRepository.java
│   │   │   │   │       ├── CategoryRepository.java
│   │   │   │   │       ├── ProductAttributeValueRepository.java
│   │   │   │   │       └── ProductRepository.java
│   │   │   │   └── users/
│   │   │   │       ├── dto/
│   │   │   │       │   ├── ChangePassRequest.java
│   │   │   │       │   ├── LogInRequest.java
│   │   │   │       │   ├── LogInResponse.java
│   │   │   │       │   └── RegisterRequest.java
│   │   │   │       ├── entity/
│   │   │   │       │   └── Users.java
│   │   │   │       ├── enums/
│   │   │   │       │   └── Role.java
│   │   │   │       ├── manager/
│   │   │   │       │   ├── UserService.java
│   │   │   │       │   └── UserServiceInterface.java
│   │   │   │       └── repository/
│   │   │   │           └── UserRepository.java
│   │   │   └── utils/
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── SalesTechWeb.sql
│   │       └── SalesTechWeb2.sql
│   └── test/
│       └── java/com/example/sale_tech_web/
│           └── SaleTechWebApplicationTests.java
├── pom.xml
├── mvnw
└── mvnw.cmd
```

### Frontend Structure

```
FE/my-react-app/
├── src/
│   ├── App.js
│   ├── App.scss
│   ├── index.js
│   ├── reportWebVitals.js
│   ├── api/
│   │   ├── apiClient.js
│   │   ├── AuthAPI.js
│   │   ├── CartAPI.js
│   │   ├── OrderAPI.js
│   │   ├── PaymentAPI.js
│   │   └── ProductAPI.js
│   ├── assets/
│   │   ├── icon/
│   │   │   └── img.png
│   │   └── images/
│   │       └── [product images]
│   ├── components/
│   │   ├── CartProducts.js
│   │   ├── Products.js
│   │   ├── cartgrid/
│   │   │   ├── CartGrid.js
│   │   │   └── CartGrid.scss
│   │   ├── filtersidebar/
│   │   │   ├── FilterSidebar.js
│   │   │   └── FilterSidebar.scss
│   │   ├── header/
│   │   │   ├── Header.js
│   │   │   └── Header.scss
│   │   ├── Loading/
│   │   │   ├── Loading.js
│   │   │   └── Loading.scss
│   │   ├── modal/
│   │   │   └── changepass/
│   │   │       ├── ChangePasswordModal.js
│   │   │       └── ChangePasswordModal.scss
│   │   ├── navigation/
│   │   │   ├── Nav.js
│   │   │   └── Nav.scss
│   │   ├── paymentProcess/
│   │   │   ├── PaymentFailed.js
│   │   │   ├── PaymentLoading.js
│   │   │   └── PaymentSuccess.js
│   │   ├── productgrid/
│   │   │   ├── ProductGrid.js
│   │   │   └── ProductGrid.scss
│   │   ├── searchbar/
│   │   │   ├── SearchBar.js
│   │   │   └── SearchBar.scss
│   │   └── Toast/
│   │       └── Toast.js
│   ├── contexts/
│   │   └── CartContext.js
│   ├── pages/
│   │   ├── aboutme/
│   │   │   ├── AboutMe.js
│   │   │   └── AboutMe.scss
│   │   ├── Cart/
│   │   │   ├── Cart.js
│   │   │   └── Cart.scss
│   │   ├── homepage/
│   │   │   ├── Home.js
│   │   │   └── Home.scss
│   │   ├── login/
│   │   │   ├── Login.js
│   │   │   ├── Login.scss
│   │   │   ├── Register.js
│   │   │   └── Register.scss
│   │   ├── order/
│   │   │   ├── Order.js
│   │   │   └── Order.scss
│   │   ├── orderhistory/
│   │   │   ├── OrderDetailModal.js
│   │   │   ├── OrderDetailModal.scss
│   │   │   ├── OrderHistory.js
│   │   │   └── OrderHistory.scss
│   │   ├── paymentresult/
│   │   │   ├── PaymentResult.js
│   │   │   └── PaymentResult.scss
│   │   ├── productdetail/
│   │   │   ├── ProductDetail.js
│   │   │   └── ProductDetail.scss
│   │   ├── profile/
│   │   │   ├── Profile.js
│   │   │   └── Profile.scss
│   │   └── verifyemail/
│   │       ├── VerifyEmail.js
│   │       ├── VerifyEmail.scss
│   │       ├── WaitingVerification.js
│   │       └── WaitingVerification.scss
│   ├── router/
│   │   ├── ProtectedRoute.js
│   │   └── RouterPages.js
│   ├── styles/
│   │   ├── index.scss
│   │   ├── _base.scss
│   │   ├── _mixins.scss
│   │   └── _variables.scss
│   └── utils/
│       ├── currencyUtils.js
│       ├── dateUtils.js
│       ├── imageUtils.js
│       ├── index.js
│       ├── orderUtils.js
│       ├── provinceUtils.js
│       ├── stringUtils.js
│       └── validationUtils.js
├── public/
│   ├── index.html
│   ├── indexIcon.png
│   ├── manifest.json
│   └── robots.txt
├── package.json
└── README.md
```

## System Requirements

### Backend
- Java JDK 17 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher

### Frontend
- Node.js 16 or higher
- npm 8 or higher

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd Technology-Sales-Website
```

### 2. Backend Installation

```bash
cd BE/sale-tech-web
mvnw clean install
```

### 3. Frontend Installation

```bash
cd FE/my-react-app
npm install
```

## Configuration

### Backend Configuration

Create a `.env` file in `BE/sale-tech-web/` directory with the following content:

```properties
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/salestech_db
DB_USER=your_db_username
DB_PASS=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# VNPay Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_RETURN_URL=http://localhost:3000/payment-result
VNPAY_IPN_URL=http://localhost:8080/api/payment/vnpay-ipn

# Email Configuration
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=your_email@gmail.com
```

### Database Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE salestech_db;
```

2. Import schema from `SalesTechWeb2.sql` file:

```bash
psql -U your_username -d salestech_db -f src/main/resources/SalesTechWeb2.sql
```

## Running the Application

### Run Backend

```bash
cd BE/sale-tech-web
mvnw spring-boot:run
```

Backend will run at: `http://localhost:8080`

### Run Frontend

```bash
cd FE/my-react-app
npm start
```

Frontend will run at: `http://localhost:3000`