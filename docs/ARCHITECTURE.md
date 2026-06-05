# Loadly Platform Architecture

## Apps

- Customer app: `mobile`
  - Phone login, quote, book vehicle, pay, track, support.
- Partner app: `partner-app`
  - Online/offline, accept jobs, update trip status, send live location, view payouts.
- Admin portal: `admin-portal`
  - Operations dashboard for customers, bookings, partners/drivers, payments, refunds, and support.
- Backend API: `backend`
  - Auth, booking lifecycle, dispatch, tracking, payment handling, admin APIs.

## Backend Domains

- Identity: users, roles, statuses.
- Customer: profile, wallet, GST/company data.
- Partner: KYC status, driver status, rating, live location.
- Fleet: partner vehicles, type, capacity, active state.
- Booking: route stops, quote, status transitions, cancellation.
- Tracking: every trip status/location event.
- Payment: intent, authorization, capture, refund, transactions.
- Payout: partner settlement windows and payment status.
- Support: tickets tied to users and bookings.
- Admin audit: every sensitive admin action.

## Booking Lifecycle

1. Customer requests quote.
2. Customer confirms booking and payment method.
3. Backend creates booking, stops, quote, payment record, and first tracking event.
4. Dispatch assigns partner.
5. Partner app moves booking through arriving, picked up, in transit, delivered.
6. Backend captures payment and prepares partner payout.
7. Admin portal monitors all operational states.

## Production Notes

- Use PostgreSQL with Prisma migrations.
- Use Redis for driver availability, matching queues, and rate limiting.
- Use WebSocket or push notifications for tracking updates.
- Use an external payment gateway for cards/UPI and webhook reconciliation.
- Use maps/geocoding provider for accurate distance and ETA.
