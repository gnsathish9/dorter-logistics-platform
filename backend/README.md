# Loadly Backend

Express API and PostgreSQL/Prisma schema for a Porter-style logistics platform.

## Run

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

The current API uses an in-memory demo store so the frontend apps can be wired immediately. The Prisma schema is ready for PostgreSQL; the next step is replacing the mock store functions with Prisma queries.

## Key APIs

- `GET /health`
- `GET /api/catalog/vehicles`
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `POST /api/quotes`
- `GET /api/bookings`
- `POST /api/bookings`
- `POST /api/bookings/:id/assign`
- `POST /api/bookings/:id/status`
- `GET /api/partners`
- `POST /api/partners/:id/location`
- `POST /api/partners/:id/availability`
- `POST /api/payments/:bookingId/intent`
- `POST /api/payments/:paymentId/capture`
- `POST /api/payments/:paymentId/refund`
- `GET /api/admin/dashboard`
- `GET /api/admin/customers`
- `GET /api/admin/partners`

## Production integrations to add

- Phone OTP provider.
- Payment gateway such as Razorpay, Stripe, Cashfree, or PayU.
- Google Maps/Mapbox geocoding and route distance.
- WebSocket or push notification service for live tracking.
- Role-based JWT authentication middleware.
