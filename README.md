# Sansi Eco Foods – E-Commerce Solution

Sansi Eco Foods is a full-stack, monorepo e-commerce solution designed for selling 100% natural, chemical-free dehydrated fruit snacks. The application comprises a customer-facing storefront, an administrative dashboard, and a shared backend powered by Firebase and Cloudinary.

---

## 🏗️ Project Architecture & Structure

The repository is organized as a monorepo containing two Next.js applications and a shared types package:

*   **[`/website`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/website)** – The customer-facing storefront built with Next.js 14 and styled using Bootstrap 5. It features product listings, detail pages, a shopping cart, checkout, and order confirmation email routing.
*   **[`/admin`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/admin)** – The owner management panel built with Next.js 14, Tailwind CSS, and Recharts. It enables catalog administration, order status workflows, analytics, and stock management.
*   **[`/shared`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/shared)** – Shared TypeScript interface definitions (`types/index.ts`) imported by both projects to guarantee schema uniformity.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 14 (App Router), React, TypeScript.
*   **Styling**: Bootstrap 5 (Storefront) & Tailwind CSS (Admin Dashboard).
*   **Backend & DB**: Firebase v12 (Firestore, Firebase Authentication).
*   **Media Hosting**: Cloudinary (unsigned preset for image uploads).
*   **Communications**: EmailJS (order confirmation emails).
*   **Hosting**: Vercel (Applications) & Firebase (Database rules and indexes).

---

## ✨ Features

### Storefront (`/website`)
*   **Dynamic Catalogue**: Real-time pricing, descriptions, and stock quantities directly fetched from Firestore (SSR).
*   **Shopping Cart**: Client-side cart operations persisted to `localStorage` with Navbar animations.
*   **Checkout & COD**: Multi-step checkout form with dynamic Sri Lankan shipping rates mapped by district.
*   **Email Confirmations**: Automated customer emails with order details and Cloudinary images via EmailJS.

### Admin Dashboard (`/admin`)
*   **Analytics**: Revenue dashboards, order counts, and graphs using Recharts.
*   **Catalog Management**: Full CRUD controls to add/edit products, categories, and upload images to Cloudinary.
*   **Order Workflows**: Track order statuses (Pending, Confirmed, Dispatched, Delivered, Cancelled) with automatic inventory updates.
*   **Staff Roles (RBAC)**: Manage team members with fine-grained security permissions (Super Admin, Editor, etc.).

---

## 🚀 Quick Start Guide

### 1. Backend Rules and Indexes
First, configure your Firebase CLI and deploy the Firestore security rules:
```bash
npm install -g firebase-tools
firebase login
firebase use --add [your-project-id]
firebase deploy --only firestore
```

### 2. Environment Configuration
Create a `.env.local` file in both `/website` and `/admin` directories.

**For Storefront (`website/.env.local`)**:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# EmailJS Keys
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

**For Admin Dashboard (`admin/.env.local`)**:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Keys
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_preset_name
```

### 3. Launching Locally
Install dependencies and run the development servers:

```bash
# Storefront (Runs on http://localhost:3000)
cd website
npm install
npm run dev

# Admin Dashboard (Runs on http://localhost:3001)
cd ../admin
npm install
npm run dev
```

*For detailed setups, database schema details, and database seeding, refer to the [Setup Guide](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/SETUP.md).*

---

## ☁️ Vercel Deployment

Both applications are configured to be deployed on Vercel separately:

1.  Import the repository as two separate Vercel projects: `sansi-eco-foods-website` and `sansi-eco-foods-admin`.
2.  Set the **Root Directory** settings to `website` and `admin` respectively.
3.  Ensure that **"Include files outside of the Root Directory in the Build Step"** is checked in **Settings > Git** (required to compile the shared types).
4.  Expose the environment variables in Vercel settings and deploy.
