# Amazon Front-End Commerce Experience

Client-ready e-commerce storefront inspired by Amazon, built with React, Firebase, Stripe, and a custom AI assistant experience.

This project demonstrates a practical, production-style shopping flow for portfolio and freelancing use: product discovery, cart management, secure checkout, order history, protected routes, and admin-facing tooling.

## What Problem This Solves

Many small businesses need a modern storefront prototype that can be validated quickly before full product rollout.

This app solves that by providing:

- A complete buyer flow from browse to payment confirmation.
- Authentication and route protection for customer and admin areas.
- Reusable architecture that is easy to customize for client-specific brands.
- AI-assisted support UX to reduce friction for common customer questions.

## My Role / Contributions

- Designed and implemented the full React front-end architecture.
- Integrated Firebase authentication, Firestore data access, and protected role-based routes.
- Built Stripe payment flow wiring and order persistence flow.
- Developed reusable UI modules (header, product cards, loaders, cart, orders, product details).
- Added admin dashboard surfaces and AI command center foundation.
- Performed production-readiness cleanup: lint hygiene, build verification, and README portfolio polish.

## Key Features

- Product listing, category filtering, and search results pages.
- Product detail view with add-to-cart flow.
- Cart with subtotal and checkout transition.
- Stripe-powered payment page and order history.
- Firebase auth flow with guarded private routes.
- Wishlist support and admin route protection.
- Chatbot interface with voice interaction support.

## Tech Stack

- Frontend: React 18, Vite, React Router
- Styling/UI: CSS modules, MUI, React Icons
- Backend Services: Firebase Auth + Firestore, Firebase Functions
- Payments: Stripe + @stripe/react-stripe-js
- Data/API: Axios, Fake Store API

## App Screenshots

### Home

![Home screen](public/screenshots/home.png)

### Category View

![Category products](public/screenshots/category-electronics.png)

### Product Detail

![Product detail](public/screenshots/product-detail.png)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and set your Firebase keys:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Quality Checks

- `npm run build` passes.
- `npm run lint` passes with one non-blocking warning in `ChatBot.jsx` (`react-hooks/exhaustive-deps`).

## Freelancing Pitch Summary

If you need a customizable e-commerce starter with real checkout flow, auth protection, and clean UI components, this repository demonstrates the build quality and delivery standards I bring to client projects.
