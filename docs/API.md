# Loadly API Draft

Base URL: `http://localhost:4000`

## Auth

- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `POST /api/register/customer`
- `POST /api/register/partner`

## Customer

- `GET /api/catalog/vehicles`
- `POST /api/test/reset`
- `POST /api/quotes`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `POST /api/support/tickets`

## Partner

- `GET /api/partners`
- `GET /api/partners/:id/jobs`
- `POST /api/partners/:id/location`
- `POST /api/partners/:id/availability`
- `POST /api/bookings/:id/accept`
- `POST /api/bookings/:id/status`

## Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/customers`
- `GET /api/admin/partners`
- `POST /api/bookings/:id/assign`

## Payments

- `POST /api/payments/:bookingId/intent`
- `POST /api/payments/:paymentId/capture`
- `POST /api/payments/:paymentId/refund`

## Example Booking Body

```json
{
  "pickupAddress": "Indiranagar, Bengaluru",
  "dropAddress": "Koramangala, Bengaluru",
  "goodsType": "Retail",
  "loadWeightKg": 120,
  "distanceKm": 11.4,
  "vehicleType": "TATA_ACE",
  "paymentMethod": "UPI"
}
```
