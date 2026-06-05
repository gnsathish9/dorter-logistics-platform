# Loadly Partner App

Expo driver/partner app for accepting trips, updating status, sending live location, and viewing payout context.

## Run

```bash
cd partner-app
npm install
npm start
```

For Expo Go SDK 54, after changing SDK versions run:

```bash
npm install
npm start -- --clear
```

## Backend

Start `backend` first. If testing on a real phone with Expo Go, update `src/api.js` and replace `localhost` with your computer's LAN IP address.
