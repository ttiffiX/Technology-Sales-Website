# Technology Sales Website

A full-stack e-commerce application that allows users to shop for technology products online.

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
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