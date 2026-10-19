# Technology Sales Website

A modern e-commerce platform for selling technology products online. Built with a **React** frontend and a **Spring Boot** backend, featuring secure authentication, product management, product reviews with replies, realtime notifications,
and VNPay payment integration.

**Documentation**: (./Document)
## Table of Contents

---

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Common Error Solutions](#common-error-solutions)
- [License](#license)
- [Learning Resources](#learning-resources)
- [Project Statistics](#project-statistics)

## Features

---

### Customer Features

| Area              | Features                                                                                                           |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| Product Catalog   | Browse products, product detail, advanced filtering by category/attributes/price, product comparison               |
| Shopping & Orders | Cart CRUD, select/deselect items, place orders, order history, cancel order, continue payment                      |
| Payments          | VNPay checkout, return callback, IPN handling                                                                      |
| Account & Auth    | Register, login, refresh token (HttpOnly cookie), logout, change password, forgot password, email OTP verification |
| Profile & Address | View/update profile, manage multiple addresses, set default address, province/ward lookup                          |
| Reviews           | Create/update/delete product reviews, view star summary, list comments, filter by rating                           |
| Notifications     | Realtime notifications via SSE, list notifications, mark read, filter by type                                      |
| System            | Image upload via Cloudinary, background schedulers for cleanup and payment timeouts                                |

### Product Manager (PM) Features

> PM accounts include all Customer features plus:

| Area                  | Features                                                                                       |
|-----------------------|------------------------------------------------------------------------------------------------|
| Product Management    | Full CRUD for products, toggle active/inactive, import products from Excel, upload images      |
| Category & Attributes | CRUD categories, attribute groups, attribute schemas; reorder groups/attributes                |
| Order Management      | View and manage orders, approve/reject, move to shipping, complete orders, status counters     |
| Review Moderation     | View all reviews, reply to reviews, update/delete replies, mark resolved, force-delete reviews |

### Admin Features

> Admin accounts include all Customer and PM features plus:

| Area                | Features                                                                                                                       |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| User Management     | List users, create users, assign roles, ban/unban, delete users                                                                |
| Revenue & Analytics | Total revenue, pending revenue, cancellation rate, daily revenue, revenue by category, top products, revenue by payment method |

### Security Features

| Feature            | Description                                        |
|--------------------|----------------------------------------------------|
| JWT Authentication | Access tokens and refresh tokens (HttpOnly cookie) |
| Role-Based Access  | RBAC for Customer / PM / Admin                     |
| Input Validation   | Request validation using Jakarta Validation        |
| OTP Flows          | Email OTP for verification and password reset      |
| Password Security  | Secure password hashing and change workflows       |

### System Features

| Feature              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| Cloudinary           | Image storage and delivery for product images                  |
| VNPay Integration    | Create payment requests, verify callbacks and IPN messages     |
| SSE Notifications    | Server-Sent Events for realtime notifications                  |
| Background Scheduler | Periodic tasks for cleanup and payment timeout handling        |
| Excel Import         | Bulk product import via Excel uploads (Apache POI / EasyExcel) |

## Tech Stack

---

| Layer        | Technology                                                                                                                  |
|--------------|-----------------------------------------------------------------------------------------------------------------------------|
| Frontend     | React 18, React Router DOM v6, Axios, Context API, SASS/SCSS, Recharts, React Toastify, @hello-pangea/dnd                   |
| Backend      | Spring Boot 3.4.0, Java 22, Spring Web, Spring Security, Spring Data JPA, Spring Validation, Spring Mail, Spring Cache, SSE |
| Database     | PostgreSQL 16 (Docker), JPA / Hibernate                                                                                     |
| Auth         | JWT (JJWT) + refresh token (HttpOnly cookie)                                                                                |
| File Storage | Cloudinary                                                                                                                  |
| Payment      | VNPay                                                                                                                       |
| Excel Import | Apache POI, EasyExcel                                                                                                       |
| DevOps       | Docker, Docker Compose, Nginx (frontend container)                                                                          |
| Utilities    | Gson, Lombok, Caffeine                                                                                                      |

## Project Structure

---

> The full directory tree is available in the `BE/` and `FE/` folders:
> - Backend structure: [`backend_structure.txt`](./BE/sale-tech-web/backend_structure.txt)
> - Frontend structure: [`frontend_structure.txt`](./FE/my-react-app/frontend_structure.txt)
>
> Below are the key paths and their purpose.

### Backend structure:

| Path          | Purpose                                                                                       |
|---------------|-----------------------------------------------------------------------------------------------|
| `/controller` | REST controllers for Customer, PM, Admin, and Notifications                                   |
| `/feature`    | Business logic grouped by feature (product, order, payment, review, notification, user, etc.) |
| `/exception`  | Custom exceptions and global exception handler                                                |
| `/config`     | Security, cache, async, and JWT configuration                                                 |
| `/resources`  | Application properties and SQL initialization files                                           |

### Frontend structure:

| Path          | Purpose                                         |
|---------------|-------------------------------------------------|
| `/api`        | API client layer (Axios)                        |
| `/assets`     | Static assets (images, fonts)                   |
| `/components` | Reusable UI components                          |
| `/contexts`   | React Contexts for shared state (Cart, Compare) |
| `/pages`      | Page components per feature/role                |
| `/router`     | Route definitions and role-based protection     |
| `/styles`     | Global and component-specific styles            |
| `/utils`      | Utility functions (API calls, auth helpers)     |

## Installation & Setup

---

### 1) Create your `.env` from template

Use the template file: [`./.env.example`](./.env.example)

1. Copy `.env.example` to `.env` in the project root.
2. Fill all required values.
3. Keep `.env` private (do not commit it).

### 2) Configure each block in `.env`

#### PostgreSQL

What you need to do:

- Set database name, user, and password.
- Keep values consistent with your local PostgreSQL conventions.

Required variables:

| Environment Variable | Example Value / Description                   |
|:---------------------|:----------------------------------------------|
| `POSTGRES_DB`        | Database name (e.g., `sale_tech_db`)          |
| `POSTGRES_USER`      | Database user (e.g., `sale_tech_user`)        |
| `POSTGRES_PASSWORD`  | Database password (e.g., `strongpassword123`) |

<br>

#### JWT

What you need to do:

- Generate a strong random `JWT_SECRET` (at least 32 characters).
- Keep expiration values as default unless you need a different session policy.

Variables:

| Environment Variable     | Default Value | Description                                               |
|:-------------------------|:--------------|:----------------------------------------------------------|
| `JWT_SECRET`             | *Required*    | The secret key used to sign and verify JWT tokens.        |
| `JWT_EXPIRATION`         | `300000`      | Access token expiration time in milliseconds (5 minutes). |
| `JWT_REFRESH_EXPIRATION` | `604800000`   | Refresh token expiration time in milliseconds (7 days).   |

<br>

#### VNPay (Sandbox) + Ngrok

What you need to do:

1. Register/login at [VNPay Sandbox Merchant portal](https://sandbox.vnpayment.vn/devreg/).
2. Copy `TMN_CODE` and `HASH_SECRET`.
3. Create a reserved domain on Ngrok (required for VNPay IPN callbacks to reach your local backend).
4. Set return and IPN URLs in VNPay dashboard.

**How to create Ngrok Reserved Domain:**

1. Sign up at [ngrok.com](https://ngrok.com/).
2. Log in to your ngrok dashboard: [dashboard.ngrok.com](https://dashboard.ngrok.com).
3. Go to **Cloud Edge** → **Domains** (left sidebar).
4. Click **+ Create Domain** → Choose a domain name (e.g., `my-saletech-api`).
5. Copy your **Auth Token** from the dashboard (Setup & Usage section).
6. Add both to your `.env` file.

Variables:

| Environment Variable | Example Value                                   | Description                                                     |
|:---------------------|:------------------------------------------------|:----------------------------------------------------------------|
| `VNPAY_TMN_CODE`     | *Required (From VNPay)*                         | The Terminal ID provided by VNPay merchant dashboard.           |
| `VNPAY_HASH_SECRET`  | *Required (From VNPay)*                         | The secret key used to secure and sign VNPay transactions.      |
| `VNPAY_RETURN_URL`   | `http://localhost:3000/payment-result`          | Frontend callback URL where users are redirected after payment. |
| `VNPAY_IPN_URL`      | `https://<your-ngrok-domain>/payment/vnpay/ipn` | Your ngrok reserved domain URL for VNPay webhook callbacks.     |
| `NGROK_AUTHTOKEN`    | *Required (From ngrok.com dashboard)*           | Your ngrok authentication token for tunnel setup.               |

<br>

#### Email (Gmail SMTP)

What you need to do:

1. Open [Gmail Account Security](https://myaccount.google.com/security).
2. Enable 2-Step Verification.
3. Go to [App Passwords](https://myaccount.google.com/apppasswords) and create a password for "Mail" and "Windows
   Computer".
4. Copy the 16-character app password.
5. Put your Gmail address + app password in `.env`.

Variables:

| Environment Variable | Example Value                    | Description                                                  |
|:---------------------|:---------------------------------|:-------------------------------------------------------------|
| `EMAIL_USERNAME`     | `your-email@gmail.com`           | Your Gmail address.                                          |
| `EMAIL_PASSWORD`     | `16-character-app-password-here` | App-specific password from Gmail (not your normal password). |
| `EMAIL_FROM`         | `your-email@gmail.com`           | Sender address for OTP/notification emails.                  |

<br>

#### Cloudinary

What you need to do:

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. Go to [Dashboard](https://cloudinary.com/console/settings/basic).
3. Copy `Cloud Name`, `API Key`, and generate/copy `API Secret`.
4. Put them in `.env`.

Variables:

| Environment Variable    | Example Value          | Description                                    |
|:------------------------|:-----------------------|:-----------------------------------------------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name`      | Your Cloudinary cloud name (from Dashboard).   |
| `CLOUDINARY_API_KEY`    | `1234567890123456`     | Your API Key (from Dashboard).                 |
| `CLOUDINARY_API_SECRET` | `abcdefghijklmnopqrst` | Your API Secret (from Dashboard Settings/API). |

## Common Error Solutions

---

### Docker & Deployment

| Error                                | Solution                                                                                                                 |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `docker compose: command not found`  | Install Docker Desktop which includes Docker Compose. Restart your terminal after installation.                          |
| `error bind: address already in use` | Stop the process using the port or change port mappings in `docker-compose.yml`. Use `netstat -ano` to find the process. |
| `Cannot connect to Docker daemon`    | Ensure Docker Desktop is running. On Windows, check that WSL2 is properly configured.                                    |

## License

---

Private project for educational and internal development purposes.

## Learning Resources

---

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [VNPay Documentation](https://sandbox.vnpayment.vn/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## Project Statistics

---

| Metric          |                       Value |
|-----------------|----------------------------:|
| Frontend        |                    React 18 |
| Backend         | Spring Boot 3.4.0 / Java 22 |
| Database        |               PostgreSQL 16 |
| Controllers     |                          18 |
| Total endpoints |                          90+|
| Tables          |                          15+|
| Deployment      |              Docker Compose |

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**Status**: Active Development
