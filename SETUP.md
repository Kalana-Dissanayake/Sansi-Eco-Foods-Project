# Sansi Eco Foods – Setup & Deployment Guide

This repository contains the full-stack e-commerce solution for **Sansi Eco Foods**, comprising a customer-facing storefront and a business management dashboard. Both applications share a single Firebase backend.

## Project Structure

- [`/website`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/website) – Public storefront built with Next.js 14 and Bootstrap 5 (Foody template styling)
- [`/admin`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/admin) – Secure owner dashboard built with Next.js 14, Tailwind CSS, and Recharts
- [`/shared`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/shared) – Shared TypeScript interfaces and types

---

## Step 1: Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**. Name it `sansi-eco-foods` (or a name of your choice).
2. Enable or disable Google Analytics as you prefer.
3. Click **Create Project**.

### Enable Firebase Services

#### 1. Authentication
1. Navigate to **Authentication** in the left sidebar and click **Get Started**.
2. Go to the **Sign-in method** tab.
3. Enable **Email/Password** provider.

#### 2. Cloud Firestore
1. Navigate to **Firestore Database** and click **Create database**.
2. Select your database location (close to Sri Lanka, e.g. `asia-south1` or `asia-east1` is recommended).
3. Start in **Production mode** (rules will be deployed from this repository).


#### 3. Cloudinary (for Product Image Uploads)
Since Firebase Storage is not free, the dashboard uses **Cloudinary's free tier** for client-side image uploading.
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. From your Dashboard, copy your **Cloud Name**.
3. Go to **Settings** (gear icon) -> **Upload** tab.
4. Scroll down to **Upload presets** and click **Add upload preset**.
5. Set the **Upload preset name** (e.g. `sansi_eco_foods`).
6. Set **Signing Mode** to **Unsigned** (crucial for client-side uploads).
7. Click **Save**.

---

## Step 2: Environment Configuration

Create a `.env.local` file in both `/website` and `/admin` directories.

### Storefront Configuration

Create [`website/.env.local`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/website/.env.local):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration (for email notifications)
# Set up a free service & template on https://www.emailjs.com/
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Admin Configuration

Create [`admin/.env.local`](file:///f:/Projects/Sansi%20Eco%20Foods%20Project/admin/.env.local):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_unsigned_preset
```

> [!TIP]
> Get your Firebase credentials by going to **Project Settings** (gear icon) in the Firebase Console under the **General** tab -> **Your apps** -> **Web app** (create one if you haven't).

---

## Step 3: Deploy Security Rules and Indexes

Install the Firebase CLI:
```bash
npm install -g firebase-tools
```

Log in to your Firebase account and select your project:
```bash
firebase login
firebase use --add
```

Deploy the firestore security rules and firestore indexes:
```bash
firebase deploy --only firestore
```

---

## Step 4: Run Locally & Seed Initial Data

### 1. Install Dependencies
```bash
# In the website folder:
cd website
npm install

# In the admin folder:
cd ../admin
npm install
```

### 2. Create the Admin User
To access the secure admin panel, you need to create a user with the `super_admin` or `staff` role in Firestore.
1. Go to the Firebase Console -> **Authentication** -> **Users** and click **Add User**.
2. Add an email (e.g. `admin@sansiecofoods.com`) and a strong password.
3. Copy the **User UID** of the newly created user.
4. Go to **Firestore Database** -> **Start Collection**.
5. Name the collection `users`.
6. Set the **Document ID** to the **User UID** you copied.
7. Add the following fields:
   - `id`: string (same User UID)
   - `email`: string (the user's email)
   - `displayName`: string (e.g. `Administrator`)
   - `role`: string (`super_admin`)
   - `isActive`: boolean (`true`)
   - `createdAt`: timestamp

### 3. Launch the Applications
In two separate terminal windows:

#### Storefront
```bash
cd website
npm run dev
# Running on http://localhost:3000
```

#### Admin Panel
```bash
cd admin
npm run dev
# Running on http://localhost:3001
```

### 4. Seed Categories and Products
Open http://localhost:3001, sign in with your admin credentials, and navigate to the Dashboard.
Upon first login, the application will automatically seed initial data, including:
- **5 Categories** (Jujubes, Fruit Chips & Coins, Mixed Assortments, etc.)
- **6 Products** with descriptions, ingredients, prices, stock quantities, and images (stored in `/images/products/` dynamically mapped)
- **Global Settings** (shipping rates, free shipping thresholds, WhatsApp contact, etc.)

---

## Step 5: EmailJS Template Configuration

To receive order confirmations via email:
1. Create a free account at [EmailJS](https://www.emailjs.com/).
2. Create an Email Service connected to your email account (Gmail, etc.).
3. Create an Email Template with the following placeholders:
   - `{{order_id}}` – The sequential order ID (e.g. `SEF-2026-0001`)
   - `{{customer_name}}` – Customer's full name
   - `{{customer_email}}` – Customer's email address
   - `{{customer_phone}}` – Customer's phone number
   - `{{shipping_address}}` – Full delivery address including district & province
   - `{{payment_method}}` – Payment method selected (typically `Cash on Delivery`)
   - `{{order_items}}` – Formatted list of purchased items (HTML/text)
   - `{{subtotal}}` – Subtotal in LKR
   - `{{shipping_fee}}` – Shipping fee in LKR
   - `{{discount}}` – Applied coupon discount (if any)
   - `{{total}}` – Total amount payable
4. Copy the service ID, template ID, and public key into `website/.env.local`.
