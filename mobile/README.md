# Loadly Mobile

Expo mobile app for Porter-style intra-city logistics booking.

## Features

- Mobile booking form for pickup, drop, distance, load weight, goods type, and schedule.
- Vehicle recommendation for two-wheelers, three-wheelers, Tata Ace, pickup, and Tata 407.
- Fare estimate based on base fare, distance, and handling.
- Booking confirmation with driver assignment.
- Tracking board, fleet metrics, support entry, and bulk order demo.

## Run locally

Install Node.js first if `npm` is not available. Start the backend separately if you want live API calls.

```bash
cd mobile
npm install
npm start
```

For Expo Go SDK 54, after changing SDK versions run:

```bash
npm install
npm start -- --clear
```

Open the Expo Go app on your phone and scan the QR code.

If testing on a real phone, update `src/api.js` and replace `localhost` with your computer's LAN IP address, for example `http://192.168.1.20:4000`.

## Next production pieces

- Wire all screens to `src/api.js`.
- Authentication with phone OTP.
- Maps, route distance, and live driver tracking.
- Push notifications for driver assigned, pickup, in transit, and delivered.
- Native Android/iOS build with Expo EAS.
