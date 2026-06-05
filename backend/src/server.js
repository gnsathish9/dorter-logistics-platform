import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { calculateQuote, recommendVehicle, rupees, vehicleCatalog } from "./pricing.js";
import { createBooking, db, fullBooking, nextId, resetDemoData } from "./mockStore.js";
import { supabase } from "./supabase.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminPortalPath = path.resolve(__dirname, "../../admin-portal");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/admin", express.static(adminPortalPath));

const bookingSchema = z.object({
  customerId: z.string().optional(),
  pickupAddress: z.string().min(3),
  dropAddress: z.string().min(3),
  goodsType: z.string().min(2),
  loadWeightKg: z.number().positive(),
  distanceKm: z.number().positive(),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  dropLat: z.number().optional(),
  dropLng: z.number().optional(),
  scheduledAt: z.string().datetime().optional(),
  vehicleType: z.string().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "WALLET"]).optional(),
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "loadly-backend", time: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <title>Loadly Backend</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: system-ui, sans-serif; margin: 40px; background: #f5f7fa; color: #17212b; }
          main { max-width: 720px; }
          a { color: #0f8b8d; font-weight: 800; display: block; margin: 12px 0; }
          code { background: white; border: 1px solid #dde5ed; border-radius: 8px; padding: 3px 6px; }
        </style>
      </head>
      <body>
        <main>
          <h1>Loadly backend is running</h1>
          <p>Use these links to check the platform:</p>
          <a href="/admin">Open Admin Portal</a>
          <a href="/api/admin/dashboard">View Admin Dashboard API</a>
          <a href="/health">Health Check</a>
          <p>Backend API base: <code>http://localhost:${port}</code></p>
        </main>
      </body>
    </html>
  `);
});

app.get("/api/catalog/vehicles", (req, res) => {
  res.json({ vehicles: vehicleCatalog });
});

app.post("/api/test/reset", (req, res) => {
  resetDemoData();
  res.json({ ok: true, message: "Demo database reset", totals: { customers: db.customers.length, partners: db.partners.length, bookings: db.bookings.length } });
});

app.post("/api/auth/otp/request", (req, res) => {
  res.json({ ok: true, message: "Mock OTP is 123456", requestId: nextId("otp") });
});

app.post("/api/auth/otp/verify", (req, res) => {
  const user = db.users.find((item) => item.phone === req.body.phone) || db.users[0];
  res.json({ token: `dev-token-${user.id}`, user });
});

app.post("/api/register/customer", async (req, res) => {
  if (!supabase) {
    const user = {
      id: nextId("usr"),
      role: "CUSTOMER",
      phone: req.body.phone,
      email: req.body.email || null,
      name: req.body.name,
      status: "ACTIVE",
    };
    const customer = {
      id: nextId("cus"),
      userId: user.id,
      companyName: req.body.companyName || null,
      gstNumber: req.body.gstNumber || null,
    };
    db.users.push(user);
    db.customers.push(customer);
    return res.status(201).json({ mode: "mock", user, customer });
  }

  const { data: user, error: userError } = await supabase
    .from("app_users")
    .insert({
      role: "CUSTOMER",
      phone: req.body.phone,
      email: req.body.email || null,
      name: req.body.name,
    })
    .select()
    .single();
  if (userError) return res.status(400).json({ error: userError.message });

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      user_id: user.id,
      company_name: req.body.companyName || null,
      gst_number: req.body.gstNumber || null,
    })
    .select()
    .single();
  if (customerError) return res.status(400).json({ error: customerError.message });
  res.status(201).json({ mode: "supabase", user, customer });
});

app.post("/api/register/partner", async (req, res) => {
  if (!supabase) {
    const user = {
      id: nextId("usr"),
      role: "PARTNER",
      phone: req.body.phone,
      email: req.body.email || null,
      name: req.body.name,
      status: "ACTIVE",
    };
    const partner = {
      id: nextId("par"),
      userId: user.id,
      status: "PENDING_KYC",
      rating: 5,
      totalTrips: 0,
      currentLat: req.body.currentLat || null,
      currentLng: req.body.currentLng || null,
      lastSeenAt: new Date().toISOString(),
    };
    const vehicle = {
      id: nextId("veh"),
      partnerId: partner.id,
      type: req.body.vehicleType || "TATA_ACE",
      plateNumber: req.body.plateNumber,
      capacityKg: Number(req.body.capacityKg || 750),
      active: true,
    };
    db.users.push(user);
    db.partners.push(partner);
    db.vehicles.push(vehicle);
    return res.status(201).json({ mode: "mock", user, partner, vehicle });
  }

  const { data: user, error: userError } = await supabase
    .from("app_users")
    .insert({
      role: "PARTNER",
      phone: req.body.phone,
      email: req.body.email || null,
      name: req.body.name,
    })
    .select()
    .single();
  if (userError) return res.status(400).json({ error: userError.message });

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .insert({
      user_id: user.id,
      status: "PENDING_KYC",
      current_lat: req.body.currentLat || null,
      current_lng: req.body.currentLng || null,
      last_seen_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (partnerError) return res.status(400).json({ error: partnerError.message });

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .insert({
      partner_id: partner.id,
      type: req.body.vehicleType || "TATA_ACE",
      plate_number: req.body.plateNumber,
      capacity_kg: Number(req.body.capacityKg || 750),
    })
    .select()
    .single();
  if (vehicleError) return res.status(400).json({ error: vehicleError.message });
  res.status(201).json({ mode: "supabase", user, partner, vehicle });
});

app.post("/api/quotes", (req, res) => {
  const schema = z.object({
    distanceKm: z.number().positive(),
    loadWeightKg: z.number().positive(),
    vehicleType: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const recommendedVehicleType = recommendVehicle(parsed.data.loadWeightKg);
  const quote = calculateQuote({
    distanceKm: parsed.data.distanceKm,
    weightKg: parsed.data.loadWeightKg,
    vehicleType: parsed.data.vehicleType || recommendedVehicleType,
  });
  res.json({ recommendedVehicleType, quote, amount: rupees(quote.totalCents) });
});

app.get("/api/bookings", (req, res) => {
  const bookings = db.bookings.map(fullBooking);
  res.json({ bookings });
});

app.post("/api/bookings", (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.status(201).json({ booking: createBooking(parsed.data) });
});

app.get("/api/bookings/:id", (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id || item.bookingCode === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json({ booking: fullBooking(booking) });
});

app.post("/api/bookings/:id/assign", (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id || item.bookingCode === req.params.id);
  const partner = db.partners.find((item) => item.id === req.body.partnerId) || db.partners[0];
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  booking.partnerId = partner.id;
  booking.status = "PARTNER_ASSIGNED";
  booking.updatedAt = new Date().toISOString();
  db.trackingEvents.push({
    id: nextId("trk"),
    bookingId: booking.id,
    partnerId: partner.id,
    status: booking.status,
    lat: partner.currentLat,
    lng: partner.currentLng,
    note: "Partner assigned",
    createdAt: new Date().toISOString(),
  });
  res.json({ booking: fullBooking(booking) });
});

app.post("/api/bookings/:id/accept", (req, res) => {
  const booking = db.bookings.find((item) => item.id === req.params.id || item.bookingCode === req.params.id);
  const partner = db.partners.find((item) => item.id === req.body.partnerId) || db.partners[0];
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.partnerId && booking.partnerId !== partner.id) {
    return res.status(409).json({ error: "Booking already assigned to another partner" });
  }

  booking.partnerId = partner.id;
  booking.status = "PARTNER_ASSIGNED";
  booking.updatedAt = new Date().toISOString();
  db.trackingEvents.push({
    id: nextId("trk"),
    bookingId: booking.id,
    partnerId: partner.id,
    status: booking.status,
    lat: partner.currentLat,
    lng: partner.currentLng,
    note: "Partner accepted booking",
    createdAt: new Date().toISOString(),
  });
  res.json({ booking: fullBooking(booking) });
});

app.post("/api/bookings/:id/status", (req, res) => {
  const status = req.body.status;
  const booking = db.bookings.find((item) => item.id === req.params.id || item.bookingCode === req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  db.trackingEvents.push({
    id: nextId("trk"),
    bookingId: booking.id,
    partnerId: booking.partnerId,
    status,
    lat: req.body.lat ?? null,
    lng: req.body.lng ?? null,
    note: req.body.note || null,
    createdAt: new Date().toISOString(),
  });
  res.json({ booking: fullBooking(booking) });
});

app.get("/api/partners", (req, res) => {
  const partners = db.partners.map((partner) => ({
    ...partner,
    user: db.users.find((user) => user.id === partner.userId),
    vehicles: db.vehicles.filter((vehicle) => vehicle.partnerId === partner.id),
  }));
  res.json({ partners });
});

app.get("/api/admin/customers", (req, res) => {
  const customers = db.customers.map((customer) => {
    const user = db.users.find((item) => item.id === customer.userId);
    const bookings = db.bookings.filter((booking) => booking.customerId === customer.id);
    const paidCents = bookings.reduce((sum, booking) => {
      const payment = db.payments.find((item) => item.bookingId === booking.id && item.status === "CAPTURED");
      return sum + (payment?.amountCents || 0);
    }, 0);

    return {
      ...customer,
      user,
      bookingCount: bookings.length,
      activeBookings: bookings.filter((booking) => !["DELIVERED", "CANCELLED", "FAILED"].includes(booking.status)).length,
      paidCents,
    };
  });
  res.json({ customers });
});

app.get("/api/admin/partners", (req, res) => {
  const partners = db.partners.map((partner) => {
    const user = db.users.find((item) => item.id === partner.userId);
    const vehicles = db.vehicles.filter((vehicle) => vehicle.partnerId === partner.id);
    const bookings = db.bookings.filter((booking) => booking.partnerId === partner.id);
    return {
      ...partner,
      user,
      vehicles,
      activeBookings: bookings.filter((booking) => !["DELIVERED", "CANCELLED", "FAILED"].includes(booking.status)).length,
      assignedBookings: bookings.length,
    };
  });
  res.json({ partners });
});

app.post("/api/partners/:id/location", (req, res) => {
  const partner = db.partners.find((item) => item.id === req.params.id);
  if (!partner) return res.status(404).json({ error: "Partner not found" });
  partner.currentLat = Number(req.body.lat);
  partner.currentLng = Number(req.body.lng);
  partner.lastSeenAt = new Date().toISOString();
  res.json({ partner });
});

app.post("/api/partners/:id/availability", (req, res) => {
  const partner = db.partners.find((item) => item.id === req.params.id);
  if (!partner) return res.status(404).json({ error: "Partner not found" });
  partner.status = req.body.status;
  res.json({ partner });
});

app.get("/api/partners/:id/jobs", (req, res) => {
  const partner = db.partners.find((item) => item.id === req.params.id);
  if (!partner) return res.status(404).json({ error: "Partner not found" });

  const partnerVehicles = db.vehicles.filter((vehicle) => vehicle.partnerId === partner.id && vehicle.active);
  const vehicleTypes = new Set(partnerVehicles.map((vehicle) => vehicle.type));
  const available = db.bookings
    .filter((booking) => booking.status === "SEARCHING_PARTNER" && vehicleTypes.has(booking.vehicleType))
    .map(fullBooking);
  const assigned = db.bookings
    .filter((booking) => booking.partnerId === partner.id && !["DELIVERED", "CANCELLED", "FAILED"].includes(booking.status))
    .map(fullBooking);

  res.json({ partner, vehicles: partnerVehicles, available, assigned });
});

app.post("/api/payments/:bookingId/intent", (req, res) => {
  const payment = db.payments.find((item) => item.bookingId === req.params.bookingId);
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  payment.status = "AUTHORIZED";
  payment.providerReference = `mock_pay_${Date.now()}`;
  res.json({ payment, clientSecret: `mock_secret_${payment.id}` });
});

app.post("/api/payments/:paymentId/capture", (req, res) => {
  const payment = db.payments.find((item) => item.id === req.params.paymentId);
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  payment.status = "CAPTURED";
  payment.capturedAt = new Date().toISOString();
  const booking = db.bookings.find((item) => item.id === payment.bookingId);
  if (booking) booking.finalFareCents = payment.amountCents;
  res.json({ payment });
});

app.post("/api/payments/:paymentId/refund", (req, res) => {
  const payment = db.payments.find((item) => item.id === req.params.paymentId);
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  payment.status = "REFUNDED";
  res.json({ payment });
});

app.get("/api/admin/dashboard", (req, res) => {
  const capturedPayments = db.payments.filter((payment) => payment.status === "CAPTURED");
  const customers = db.customers.map((customer) => {
    const user = db.users.find((item) => item.id === customer.userId);
    const bookings = db.bookings.filter((booking) => booking.customerId === customer.id);
    const paidCents = bookings.reduce((sum, booking) => {
      const payment = db.payments.find((item) => item.bookingId === booking.id && item.status === "CAPTURED");
      return sum + (payment?.amountCents || 0);
    }, 0);

    return {
      ...customer,
      user,
      bookingCount: bookings.length,
      activeBookings: bookings.filter((booking) => !["DELIVERED", "CANCELLED", "FAILED"].includes(booking.status)).length,
      paidCents,
    };
  });
  const partners = db.partners.map((partner) => {
    const user = db.users.find((item) => item.id === partner.userId);
    const vehicles = db.vehicles.filter((vehicle) => vehicle.partnerId === partner.id);
    const bookings = db.bookings.filter((booking) => booking.partnerId === partner.id);
    return {
      ...partner,
      user,
      vehicles,
      activeBookings: bookings.filter((booking) => !["DELIVERED", "CANCELLED", "FAILED"].includes(booking.status)).length,
      assignedBookings: bookings.length,
    };
  });

  res.json({
    totals: {
      customers: db.customers.length,
      partners: db.partners.length,
      bookings: db.bookings.length,
      activeBookings: db.bookings.filter((booking) => !["DELIVERED", "CANCELLED", "FAILED"].includes(booking.status)).length,
      revenueCents: capturedPayments.reduce((sum, payment) => sum + payment.amountCents, 0),
    },
    bookings: db.bookings.map(fullBooking),
    customers,
    partners,
    payments: db.payments,
  });
});

app.post("/api/support/tickets", (req, res) => {
  const ticket = {
    id: nextId("ticket"),
    userId: req.body.userId || "usr_customer_demo",
    bookingId: req.body.bookingId || null,
    status: "OPEN",
    subject: req.body.subject,
    message: req.body.message,
    createdAt: new Date().toISOString(),
  };
  db.supportTickets = [ticket, ...(db.supportTickets || [])];
  res.status(201).json({ ticket });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Loadly backend running on http://localhost:${port}`);
});
