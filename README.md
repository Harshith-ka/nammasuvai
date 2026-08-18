# 🌿 Organic Hub — Complete Full-Stack E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Executive Overview

**Organic Hub** is a state-of-the-art, farm-to-table organic produce and sustainable products e-commerce platform. Engineered with a highly responsive, animated modern web interface (`Next.js 16` + `React 19` + `Tailwind CSS v4` + `Framer Motion` + `GSAP`) and a robust, scalable enterprise backend API (`Node.js`, `Express 5`, `TypeScript`, `MongoDB`), Organic Hub connects conscious consumers directly with certified organic farmers and suppliers.

---

## 🏛️ System Architecture & Directory Structure

```
organic_hub/
├── backend/                    # Node.js + Express 5 + TypeScript REST API
│   ├── src/
│   │   ├── config/             # Database & third-party service configurations (Cloudinary, Razorpay, etc.)
│   │   ├── controllers/        # Business logic controllers for all REST resources
│   │   ├── middlewares/        # Authentication (JWT), file upload (Multer), & error handling
│   │   ├── models/             # Mongoose schemas (User, Product, Order, Basket, Vendor, etc.)
│   │   ├── routes/             # Express route definitions
│   │   ├── utils/              # PDFKit invoice generator, mailer, and helpers
│   │   ├── index.ts            # Main application server entry point
│   │   └── seed*.ts            # Automated database seeding scripts
│   ├── scrape.js               # Puppeteer-based scraper for organic produce catalog enrichment
│   └── package.json
│
└── frontend/                   # Next.js 16 (App Router) + React 19 Frontend Storefront & Admin Portal
    ├── src/
    │   ├── app/                # Application routes (Customer Storefront, Authentication, & Admin Portal)
    │   ├── components/         # Reusable UI components & design system (Shadcn/UI + Custom UI)
    │   ├── lib/                # API client (Axios), utilities, and formatters
    │   ├── store/              # Global application state management (Zustand)
    │   └── types/              # TypeScript interfaces & domain models
    └── package.json
```

---

## 🚀 Key Features & Capabilities

### 🛒 Customer Storefront (Frontend)
- **Dynamic Product Discovery**: Browse organic fruits, vegetables, dairy, grains, and eco-friendly products with responsive filtering, search, and category navigation.
- **Curated Organic Baskets**: Pre-curated, subscription-ready weekly produce baskets (`/baskets`).
- **Interactive Cart & Wishlist**: Real-time state management using `Zustand` with instant feedback and animations (`Framer Motion` & `GSAP`).
- **Seamless Checkout & Address Management**: Multi-step checkout flow supporting saved user addresses and integrated payment gateways.
- **Order Tracking & Profile**: Comprehensive account management with past order history, status updates, and downloadable PDF invoices.

### 🛡️ Admin & Vendor Management Portal
- **Dashboard & Analytics**: Real-time sales metrics, revenue reports, and inventory insights (`/admin`).
- **Catalog Management**: Create, update, and categorize products, banners, and promotional flash sales.
- **Coupon & Promotional Engine**: Manage percentage/flat discounts, usage limits, and validity windows.
- **Vendor & Supply Chain Oversight**: Track supplier farms and inventory provenance.

### ⚙️ Backend REST API & Services
- **Secure Authentication & Authorization**: Role-based access control (RBAC) via JWT & `bcrypt`.
- **Payment Gateway Integration**: Built-in support for **Razorpay** and **Paytm Checksum** payment processing.
- **Automated PDF Invoice Generation**: Programmatic receipt and tax invoice PDF generation via `PDFKit`.
- **Cloud Media Management**: Direct asset upload and optimization via **Cloudinary** and **Multer**.
- **Automated Data Scraper**: Integrated `Puppeteer` scraping workflow (`scrape.js`, `parse_data.js`) for catalog bootstrapping.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) + React 19 | Server-side rendering, routing, and high-performance UI |
| **Styling & Animations** | Tailwind CSS v4, Framer Motion, GSAP | Fluid glassmorphism, responsive layouts, and micro-animations |
| **State Management** | Zustand | Lightweight, high-speed global state (Cart, User Auth, Wishlist) |
| **Backend Framework** | Node.js + Express 5 (TypeScript) | Fast, strongly-typed REST API server |
| **Database & ORM** | MongoDB + Mongoose 9 | Document database with schema validation and indexing |
| **Payments & Invoicing** | Razorpay, Paytm Checksum, PDFKit | Secure transaction verification & PDF order documentation |
| **Cloud Storage & Email** | Cloudinary, Nodemailer | Media asset storage and transactional email alerts |

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer or vendor account
- `POST /api/auth/login` — Authenticate user and issue JWT token

### 🍎 Products & Catalog (`/api/products`, `/api/categories`, `/api/baskets`)
- `GET /api/products` — Retrieve paginated, filterable product catalog
- `GET /api/products/:id` — Get detailed product specifications and vendor details
- `GET /api/categories` — Fetch nested category hierarchy
- `GET /api/baskets` — Retrieve curated organic bundle baskets

### 🏷️ Promotions (`/api/banners`, `/api/flash-sales`, `/api/coupons`)
- `GET /api/banners` — Retrieve active homepage hero banners
- `GET /api/flash-sales` — Get active countdown flash sale promotions
- `POST /api/coupons/validate` — Validate and apply promotional coupon code

### 📦 Orders & Payments (`/api/orders`)
- `POST /api/orders` — Create a new order
- `GET /api/orders/my-orders` — Retrieve authenticated user's order history
- `GET /api/orders/:id` — Get detailed order status and line items
- `GET /api/orders/:id/invoice` — Download generated PDF invoice

---

## 💻 Local Development & Setup Guide

### Prerequisites
- **Node.js** v20+
- **MongoDB** instance (Local or MongoDB Atlas connection string)
- **Cloudinary** credentials (optional for local mock uploads)

### 1️⃣ Backend Setup (`/backend`)
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/organic_hub
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Seed initial database data and launch dev server:
```bash
npm run seed
npm run dev
```
Backend API will run at `http://localhost:5000`.

### 2️⃣ Frontend Setup (`/frontend`)
```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the Next.js development server:
```bash
npm run dev
```
Frontend Web App will run at `http://localhost:3000`.

---

## 📜 Available NPM Scripts

### Backend (`/backend/package.json`)
- `npm run dev`: Start API server in watch mode with `tsx`
- `npm run seed`: Populate database with base organic categories & products
- `npm run seed:more`: Add extended product inventory
- `npm run seed:orders`: Seed realistic order histories and analytics data

### Frontend (`/frontend/package.json`)
- `npm run dev`: Launch Next.js 16 development server
- `npm run build`: Create production-ready Next.js bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks

---

## 📄 License & Ownership
Copyright © 2026 Organic Hub. All rights reserved.
