# SecureTrust Bank — MERN Microservices Banking App

A full-stack, end-to-end **Customer Service Banking Application** built with the **MERN stack**
(MongoDB, Express, React, Node.js), using a **microservices architecture** with an API Gateway,
**JWT-based Authentication & Role-Based Authorization** (Admin / Employee / User), and a fully
**responsive Bootstrap 5** UI.

---

## 1. Architecture Overview

```
                        ┌───────────────────────┐
                        │   React Frontend       │
                        │   (Bootstrap 5, :3000) │
                        └───────────┬────────────┘
                                    │  REST calls to :5000/api/*
                                    ▼
                        ┌───────────────────────┐
                        │   API Gateway          │
                        │   (Express, :5000)     │
                        └───┬───────┬────────┬───┘
             /api/auth      │       │        │  /api/services
             ┌──────────────┘       │        └──────────────┐
             ▼                      │  /api/offers           ▼
  ┌───────────────────┐            ▼                ┌────────────────────┐
  │  auth-service      │  ┌────────────────────┐    │  services-service   │
  │  :5001             │  │  offers-service     │    │  :5003              │
  │  db: bank_auth_db  │  │  :5002              │    │  db: bank_services_db│
  └─────────┬──────────┘  │  db: bank_offers_db │    └──────────┬──────────┘
            │             └──────────┬──────────┘               │
            ▼                        ▼                          ▼
     MongoDB (local, via MongoDB Compass — mongodb://127.0.0.1:27017)
```

**4 microservices** in total:
1. **gateway** — single entry point, proxies requests to the right service
2. **auth-service** — registration, login, JWT issuing, profile, admin user management
3. **offers-service** — CRUD for bank offers (loans, cards, FD, savings, etc.)
4. **services-service** — CRUD for bank services (savings accounts, digital banking, etc.)

Each backend microservice has its **own MongoDB database** (visible as separate databases in
MongoDB Compass): `bank_auth_db`, `bank_offers_db`, `bank_services_db`.

## 2. Roles & Permissions

| Action                          | Admin | Employee | User (Customer) |
|----------------------------------|:-----:|:--------:|:----------------:|
| Register / Login                 | ✅    | ✅       | ✅ (self-register)|
| View Offers & Services            | ✅    | ✅       | ✅               |
| Create / Edit Offers & Services   | ✅    | ✅       | ❌               |
| Delete Offers & Services          | ✅    | ❌       | ❌               |
| Manage Users (create/edit roles)  | ✅    | ❌       | ❌               |
| Delete Users                      | ✅    | ❌       | ❌               |
| Edit own profile                  | ✅    | ✅       | ✅               |

Authentication uses **JWT** (`jsonwebtoken`) signed with a shared secret. Each microservice
independently verifies the token from the `Authorization: Bearer <token>` header — no service
is a single point of failure for auth checks.

---

## 3. Prerequisites

- **Node.js** v18+ and npm v9+ ([nodejs.org](https://nodejs.org))
- **MongoDB Community Server** running locally on `mongodb://127.0.0.1:27017`
- **MongoDB Compass** (you already have this) — used to *view* the databases/collections each
  service creates automatically on first run. You do not need to create the databases manually;
  Mongoose + your app will create them (and seed sample data) the first time each service starts.

---

## 4. Project Structure

```
banking-app/
├── backend/
│   ├── gateway/            # API Gateway (:5000)
│   ├── auth-service/       # Auth & Users microservice (:5001)
│   ├── offers-service/     # Offers microservice (:5002)
│   └── services-service/   # Services microservice (:5003)
└── frontend/                # React + Bootstrap app (:3000)
```

Every backend service folder has: `server.js`, `config/db.js`, `models/`, `routes/`,
`controllers/`, `middleware/auth.js`, `package.json`, and a `.env` (already filled in with
working local defaults — no editing required to get started).

---

## 5. Setup & Run Instructions

Open **5 separate terminals** (one per service + frontend). Run each block below in its own terminal.

### Step 0 — Make sure MongoDB is running locally
Make sure your local MongoDB server (`mongod`) is running before starting the backend services
(MongoDB Compass connects to it, but Compass does not start the server by itself). If you installed
MongoDB Community Edition normally, it usually already runs as a background service.

### Step 1 — Auth Service (Terminal 1)
```bash
cd backend/auth-service
npm install
npm start
```
Runs on **http://localhost:5001**. On first run it seeds a default admin account:
- **Email:** `admin@bankapp.com`
- **Password:** `Admin@123`

### Step 2 — Offers Service (Terminal 2)
```bash
cd backend/offers-service
npm install
npm start
```
Runs on **http://localhost:5002** and seeds 4 sample bank offers.

### Step 3 — Services Service (Terminal 3)
```bash
cd backend/services-service
npm install
npm start
```
Runs on **http://localhost:5003** and seeds 5 sample bank services.

### Step 4 — API Gateway (Terminal 4)
```bash
cd backend/gateway
npm install
npm start
```
Runs on **http://localhost:5000**. This is the ONLY backend URL the frontend talks to.

> Start the gateway **after** the 3 services above (order doesn't strictly matter for booting,
> but the gateway is the one the frontend depends on, so make sure all 4 are running).

### Step 5 — Frontend (Terminal 5)
```bash
cd frontend
npm install
npm start
```
Runs on **http://localhost:3000** and opens automatically in your browser.

---

## 6. Verifying it Works

1. Visit `http://localhost:3000` — you should see the Home page with sample **Offers** and
   **Services** already loaded (seeded automatically).
2. Click **Login**, use the seeded admin: `admin@bankapp.com` / `Admin@123`.
3. Go to **Dashboard → Manage Users** to create Employee or additional Admin/User accounts.
4. Go to **Offers** / **Services** — as Admin/Employee you'll see **New Offer / New Service**
   buttons and edit/delete controls on each card. Log out and register a normal customer account
   to confirm they only see a read-only view.
5. Open **MongoDB Compass**, connect to `mongodb://127.0.0.1:27017`, and you'll see 3 new
   databases: `bank_auth_db`, `bank_offers_db`, `bank_services_db`, each with their own collections.

---

## 7. API Reference (via Gateway — http://localhost:5000)

### Auth (`/api/auth`)
| Method | Endpoint            | Access          | Description                    |
|--------|----------------------|-----------------|---------------------------------|
| POST   | `/register`          | Public          | Register a new customer         |
| POST   | `/login`              | Public          | Login, returns JWT              |
| GET    | `/me`                 | Authenticated   | Get own profile                 |
| PUT    | `/me`                 | Authenticated   | Update own name/phone           |
| GET    | `/users`              | Admin           | List all users                  |
| POST   | `/users`              | Admin           | Create a user with any role     |
| PUT    | `/users/:id`          | Admin           | Update a user (role, status...) |
| DELETE | `/users/:id`          | Admin           | Delete a user                   |

### Offers (`/api/offers`)
| Method | Endpoint     | Access            | Description               |
|--------|--------------|-------------------|-----------------------------|
| GET    | `/`          | Public            | List active offers          |
| GET    | `/:id`       | Public            | Get one offer                |
| POST   | `/`          | Admin, Employee   | Create an offer              |
| PUT    | `/:id`       | Admin, Employee   | Update an offer              |
| DELETE | `/:id`       | Admin only        | Delete an offer              |

### Services (`/api/services`)
Same pattern as Offers above, mounted at `/api/services`.

---

## 8. Environment Variables

Each service ships with a working `.env` for local development, and a `.env.example` documenting
the variables. Key ones:

- `MONGO_URI` — MongoDB connection string (per-service database)
- `JWT_SECRET` — **must be identical across auth-service, offers-service, services-service, and
  gateway is stateless so it doesn't need it** — this is what lets each service verify tokens
  independently.
- `PORT` — the port each service listens on
- `REACT_APP_API_BASE_URL` (frontend `.env`) — points to the gateway, `http://localhost:5000/api`

**For a real deployment**, change `JWT_SECRET` to a long random string and update it consistently
across all three backend services.

---

## 9. Tech Stack

- **Frontend:** React 18, React Router 6, Bootstrap 5, Bootstrap Icons, Axios
- **Backend:** Node.js, Express 4, Mongoose 8, JSON Web Token, bcryptjs, http-proxy-middleware
- **Database:** MongoDB (local, viewed via MongoDB Compass)
- **Architecture:** Microservices + API Gateway pattern

---

## 10. Notes & Next Steps (optional enhancements)

- Add Docker Compose to containerize all 4 services + a Mongo container for one-command startup.
- Add refresh tokens / token blacklisting for logout-everywhere support.
- Add pagination and search to the Offers/Services list views.
- Add a transactions/accounts microservice for real banking operations (deposits, transfers).
- Add automated tests (Jest + Supertest for backend, React Testing Library for frontend).
