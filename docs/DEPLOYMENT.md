# Deployment Guide

## Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql` for starter data.
5. Copy these values into Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

Use the service role key only in backend/server environments. Do not put it in mobile apps.

## Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.

The backend/admin project is configured with `vercel.json`.

## Mobile Apps

For development, Expo Go can call your local backend using your computer LAN IP.

For production, change:

- `mobile/src/api.js`
- `partner-app/src/api.js`

to your hosted Vercel API URL.

## Google Maps

Create a Google Cloud project and enable:

- Maps SDK for Android
- Maps SDK for iOS
- Places API
- Geocoding API
- Directions API

Store the key as `GOOGLE_MAPS_API_KEY`. Restrict the key before launch.

For Expo maps after SDK 54 install is healthy:

```bash
npx expo install react-native-maps
```

Then add real `MapView` screens for customer route preview and partner live job navigation.
