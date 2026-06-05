# Database Schema Summary

Full Prisma schema: `backend/prisma/schema.prisma`

## Main Tables

- `User`: login identity for customer, partner, admin, and support roles.
- `CustomerProfile`: customer-specific business data and wallet.
- `PartnerProfile`: driver/partner KYC, rating, live location, and availability.
- `Vehicle`: partner vehicle details, plate number, vehicle type, and capacity.
- `Booking`: central trip/order entity.
- `BookingStop`: pickup, drop, and waypoint addresses.
- `Quote`: base fare, distance charge, handling charge, tax, and total.
- `Payment`: current payment state for a booking.
- `Transaction`: payment provider events for authorization, capture, refund, and failures.
- `Payout`: partner settlement records.
- `TrackingEvent`: trip status and location history.
- `SupportTicket`: customer/partner support cases.
- `AdminAuditLog`: record of sensitive admin actions.

## Important Enums

- `UserRole`: `CUSTOMER`, `PARTNER`, `ADMIN`, `SUPPORT`
- `VehicleType`: `TWO_WHEELER`, `THREE_WHEELER`, `TATA_ACE`, `PICKUP_8FT`, `TATA_407`
- `BookingStatus`: `SEARCHING_PARTNER`, `PARTNER_ASSIGNED`, `ARRIVING`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`
- `PaymentStatus`: `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`
- `PaymentMethod`: `CASH`, `UPI`, `CARD`, `WALLET`
