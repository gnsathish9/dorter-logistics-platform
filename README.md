# Loadly Logistics Platform

A Porter-inspired logistics platform for intra-city goods delivery. The repo includes a backend API, PostgreSQL database schema, customer mobile app, partner mobile app, admin portal, and the earlier quick web prototype.

## Platform modules

- `backend`: Express API, Prisma database schema, mock demo store, bookings, tracking, payments, partner operations, admin dashboard.
- `mobile`: Customer Expo app for booking vehicles, fare estimates, confirmations, and tracking.
- `partner-app`: Driver/partner Expo app for availability, assigned jobs, live location, and trip status.
- `admin-portal`: Admin operations portal for customers, bookings, driver partners, and payment handling.
- Root `index.html`: quick static web prototype.

## Docs

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DATABASE.md`

## Database

The database schema lives at `backend/prisma/schema.prisma`.

Core tables:

- Users and roles: customers, partners, admins, support.
- Customer profiles and partner profiles.
- Vehicles and vehicle capacity.
- Bookings, stops, quotes, tracking events.
- Payments, transactions, refunds, and payouts.
- Support tickets and admin audit logs.

## Run backend

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Backend URL: `http://localhost:4000`

## Run customer app

```bash
cd mobile
npm install
npm start -- --clear
```

Scan the Expo QR code with Expo Go.

## Run partner app

```bash
cd partner-app
npm install
npm start -- --clear
```

## Run admin portal

Start the backend, then open `admin-portal/index.html`.

When served by the backend, use:

```text
http://localhost:4000/admin/
```

The admin portal auto-refreshes every 5 seconds.

## Test live flow

1. Reset demo data:

```powershell
Invoke-WebRequest -Uri http://localhost:4000/api/test/reset -Method POST -UseBasicParsing
```

2. Open admin at `http://localhost:4000/admin/`.
3. Start the customer app and create a booking.
4. Start the partner app, tap refresh if needed, then accept the new request.
5. Watch admin update the booking from `SEARCHING_PARTNER` to `PARTNER_ASSIGNED`.

## Payment handling

The backend includes mock payment intent, capture, and refund endpoints:

- `POST /api/payments/:bookingId/intent`
- `POST /api/payments/:paymentId/capture`
- `POST /api/payments/:paymentId/refund`

For production, connect these handlers to Razorpay, Stripe, Cashfree, or PayU webhooks.

## Next build milestones

- Replace the backend mock store with Prisma queries.
- Add JWT auth and role-based access control.
- Add real maps/geocoding for route distance and live tracking.
- Add payment gateway webhooks and reconciliation.
- Add push notifications for customer and partner apps.
- Build EAS Android/iOS releases.
