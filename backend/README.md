# ShopTrip Backend API & Database

Backend service and PostgreSQL database layer for the **ShopTrip** mobile and web ecosystem.

## 1. Architecture Overview

- **Runtime**: Node.js with TypeScript and Express.
- **ORM**: Prisma ORM with PostgreSQL.
- **Authentication**: Salted Bcrypt password hashing + stateless signed JSON Web Tokens (JWT).
- **Authorization**: Ownership-verified queries ensuring authenticated users cannot view or manipulate other users' shopping trips.
- **Client Decoupling**: The Expo mobile application and future web portal connect via REST endpoints (`/api/...`). The mobile client never connects directly to the PostgreSQL database.

---

## 2. Relational Database Schema

```
+---------------+       +------------------+       +---------------+
|     User      |       |     Category     |       |   Retailer    |
+---------------+       +------------------+       +---------------+
| id (PK)       |       | id (PK)          |       | id (PK)       |
| email (UQ)    |       | name (UQ)        |       | name (UQ)     |
| passwordHash  |       | description      |       | websiteUrl    |
| createdAt     |       +--------+---------+       | searchUrl     |
| updatedAt     |                |                 | isActive      |
+-------+-------+                |                 +-------+-------+
        |                        |                         |
        | 1:N                    | 1:N                     | 1:N
+-------v-------+       +--------v---------+       +-------v-------+
| ShoppingTrip  |       |     Product      |<------+ RetailerOffer |
+---------------+       +------------------+ 1:N   +---------------+
| id (PK)       |       | id (PK)          |       | id (PK)       |
| userId (FK)   |       | barcode (UQ)     |       | productId(FK) |
| name          |       | productName      |       | retailerId(FK)|
| status        |       | brand            |       | price         |
+-------+-------+       | sizeInfo         |       | currency      |
        |               | categoryId (FK)  |       | deliveryTime  |
        | 1:N           | imageUrl         |       | availability  |
+-------v-------+       | verificationStat |       | source        |
|   TripItem    |------>| createdAt        |       | lastChecked   |
+---------------+ N:1   | updatedAt        |       +---------------+
| id (PK)       |       +------------------+
| tripId (FK)   |
| productId(FK) |
| quantity      |
| shelfPrice    |
| selectedOffer |
+---------------+
```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```powershell
cp .env.example .env
```

### Server-Only Secrets (NEVER expose to Expo client)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:secret@localhost:5432/shoptrip?schema=public` |
| `JWT_SECRET` | Secret key for signing authorization tokens | Random 32+ character string |
| `JWT_EXPIRES_IN` | Session validity duration | `7d` |
| `PORT` | API server port | `3000` |
| `CORS_ORIGINS` | Permitted client origins | `http://localhost:8081,http://localhost:3000` |

### Client-Side Public Variables (Used in `mobile/.env`)

| Variable | Description | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Target API URL reachable by the mobile app | `http://localhost:3000/api` |

*(Note: When testing on Android Emulator, use `http://10.0.2.2:3000/api`. On physical devices, use your local network IP e.g. `http://192.168.1.X:3000/api`)*

---

## 4. PostgreSQL Setup Instructions

### Option A — Hosted PostgreSQL (Recommended for fastest zero-install setup)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).
2. Copy the pooled connection string provided by the dashboard.
3. Paste it as `DATABASE_URL` in `ShopTrip/backend/.env`.

### Option B — Local PostgreSQL Installation
1. Install PostgreSQL 15+ for Windows.
2. In pgAdmin or SQL Shell (`psql`):
   ```sql
   CREATE DATABASE shoptrip;
   ```
3. Set your connection string in `ShopTrip/backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/shoptrip?schema=public"
   ```

---

## 5. Migration & Build Commands

Run from the `ShopTrip/backend` directory:

```powershell
# 1. Install dependencies
cmd /c "npm install"

# 2. Generate Prisma Client
cmd /c "npm run prisma:generate"

# 3. Apply schema to database
cmd /c "npm run prisma:migrate -- --name init"

# 4. Start the development server
cmd /c "npm run dev"
```

---

## 6. API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | None | Check API and database connectivity status. |
| `/api/auth/register` | POST | None | Create a registered account with email & password. |
| `/api/auth/login` | POST | None | Authenticate with credentials and receive a JWT. |
| `/api/auth/me` | GET | Bearer | Retrieve profile for current authenticated user. |
| `/api/products/barcode/:code` | GET | None | Lookup product and verified retailer offers by barcode. |
| `/api/products/search?q=...` | GET | None | Search products by name, brand, category, or barcode. |
| `/api/products/:id/offers` | GET | None | Retrieve active retailer offers for product ID. |
| `/api/trips` | GET | Bearer | List current user's shopping trips. |
| `/api/trips` | POST | Bearer | Create a new shopping trip. |
| `/api/trips/:id` | GET | Bearer | Retrieve trip details with items and prices. |
| `/api/trips/:id` | DELETE | Bearer | Delete a shopping trip. |
| `/api/trips/:id/items` | POST | Bearer | Add an item to a shopping trip. |
| `/api/trips/:id/items/:itemId` | PUT | Bearer | Update item quantity or shelf price. |
| `/api/trips/:id/items/:itemId` | DELETE | Bearer | Remove item from shopping trip. |
