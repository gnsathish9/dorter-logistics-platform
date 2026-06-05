import { calculateQuote, recommendVehicle } from "./pricing.js";

const locations = {
  indiranagar: { address: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408 },
  koramangala: { address: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
  hsr: { address: "HSR Layout, Bengaluru", lat: 12.9116, lng: 77.6474 },
  electronicCity: { address: "Electronic City, Bengaluru", lat: 12.8452, lng: 77.6602 },
  peenya: { address: "Peenya Industrial Area, Bengaluru", lat: 13.0285, lng: 77.5197 },
  krMarket: { address: "KR Market, Bengaluru", lat: 12.9614, lng: 77.5761 },
  whitefield: { address: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499 },
  mgRoad: { address: "MG Road, Bengaluru", lat: 12.9758, lng: 77.6090 },
  yeshwanthpur: { address: "Yeshwanthpur, Bengaluru", lat: 13.0250, lng: 77.5340 },
  banashankari: { address: "Banashankari, Bengaluru", lat: 12.9255, lng: 77.5468 },
};

function iso(minutesOffset = 0) {
  return new Date(Date.now() + minutesOffset * 60 * 1000).toISOString();
}

function booking({
  id,
  code,
  customerId,
  partnerId = null,
  vehicleType,
  status,
  goodsType,
  weight,
  distance,
  fare,
  createdOffset = 0,
}) {
  return {
    id,
    bookingCode: code,
    customerId,
    partnerId,
    vehicleType,
    status,
    goodsType,
    loadWeightKg: weight,
    distanceKm: distance,
    quotedFareCents: fare,
    finalFareCents: status === "DELIVERED" ? fare : null,
    scheduledAt: null,
    createdAt: iso(createdOffset),
    updatedAt: iso(createdOffset),
  };
}

function stop(id, bookingId, type, location, sequence) {
  return { id, bookingId, type, address: location.address, lat: location.lat, lng: location.lng, sequence };
}

export function createDemoData() {
  return {
    users: [
      { id: "usr_customer_demo", role: "CUSTOMER", phone: "+919000000001", name: "Demo Customer", status: "ACTIVE" },
      { id: "usr_customer_fresh", role: "CUSTOMER", phone: "+919000000004", name: "Fresh Mart Manager", status: "ACTIVE" },
      { id: "usr_customer_home", role: "CUSTOMER", phone: "+919000000005", name: "Ananya Rao", status: "ACTIVE" },
      { id: "usr_partner_demo", role: "PARTNER", phone: "+919000000002", name: "Ravi Kumar", status: "ACTIVE" },
      { id: "usr_partner_ace", role: "PARTNER", phone: "+919000000006", name: "Aman Sheikh", status: "ACTIVE" },
      { id: "usr_partner_pickup", role: "PARTNER", phone: "+919000000007", name: "Farah Merchant", status: "ACTIVE" },
      { id: "usr_partner_bike", role: "PARTNER", phone: "+919000000008", name: "Nikhil Patil", status: "ACTIVE" },
      { id: "usr_admin_demo", role: "ADMIN", phone: "+919000000003", name: "Ops Admin", status: "ACTIVE" },
    ],
    customers: [
      { id: "cus_demo", userId: "usr_customer_demo", companyName: "Demo Retail Store", gstNumber: "29ABCDE1234F1Z5" },
      { id: "cus_fresh", userId: "usr_customer_fresh", companyName: "Fresh Mart", gstNumber: "29FRESH1234F1Z9" },
      { id: "cus_home", userId: "usr_customer_home", companyName: null, gstNumber: null },
    ],
    partners: [
      {
        id: "par_demo",
        userId: "usr_partner_demo",
        status: "ACTIVE",
        rating: 4.9,
        totalTrips: 213,
        currentLat: locations.mgRoad.lat,
        currentLng: locations.mgRoad.lng,
        lastSeenAt: iso(),
      },
      {
        id: "par_ace",
        userId: "usr_partner_ace",
        status: "ACTIVE",
        rating: 4.7,
        totalTrips: 141,
        currentLat: locations.hsr.lat,
        currentLng: locations.hsr.lng,
        lastSeenAt: iso(),
      },
      {
        id: "par_pickup",
        userId: "usr_partner_pickup",
        status: "ACTIVE",
        rating: 4.8,
        totalTrips: 188,
        currentLat: locations.peenya.lat,
        currentLng: locations.peenya.lng,
        lastSeenAt: iso(),
      },
      {
        id: "par_bike",
        userId: "usr_partner_bike",
        status: "OFFLINE",
        rating: 4.6,
        totalTrips: 98,
        currentLat: locations.koramangala.lat,
        currentLng: locations.koramangala.lng,
        lastSeenAt: iso(-18),
      },
    ],
    vehicles: [
      { id: "veh_demo", partnerId: "par_demo", type: "TATA_ACE", plateNumber: "KA01AB1234", capacityKg: 750, active: true },
      { id: "veh_ace", partnerId: "par_ace", type: "TATA_ACE", plateNumber: "KA05CD9087", capacityKg: 750, active: true },
      { id: "veh_pickup", partnerId: "par_pickup", type: "PICKUP_8FT", plateNumber: "KA03PQ4421", capacityKg: 1200, active: true },
      { id: "veh_bike", partnerId: "par_bike", type: "TWO_WHEELER", plateNumber: "KA04MN2211", capacityKg: 20, active: true },
    ],
    bookings: [
      booking({
        id: "book_demo",
        code: "LDY-4821",
        customerId: "cus_demo",
        partnerId: "par_demo",
        vehicleType: "TATA_ACE",
        status: "PARTNER_ASSIGNED",
        goodsType: "Retail stock",
        weight: 120,
        distance: 11.4,
        fare: 57500,
        createdOffset: -25,
      }),
      booking({
        id: "book_open_ace",
        code: "LDY-4930",
        customerId: "cus_fresh",
        vehicleType: "TATA_ACE",
        status: "SEARCHING_PARTNER",
        goodsType: "Appliances",
        weight: 180,
        distance: 8.2,
        fare: 55800,
        createdOffset: -8,
      }),
      booking({
        id: "book_open_pickup",
        code: "LDY-5012",
        customerId: "cus_demo",
        vehicleType: "PICKUP_8FT",
        status: "SEARCHING_PARTNER",
        goodsType: "Wholesale cartons",
        weight: 900,
        distance: 18,
        fare: 110400,
        createdOffset: -4,
      }),
      booking({
        id: "book_transit",
        code: "LDY-4777",
        customerId: "cus_home",
        partnerId: "par_ace",
        vehicleType: "TATA_ACE",
        status: "IN_TRANSIT",
        goodsType: "House shifting",
        weight: 420,
        distance: 15.6,
        fare: 81700,
        createdOffset: -52,
      }),
      booking({
        id: "book_delivered",
        code: "LDY-4699",
        customerId: "cus_fresh",
        partnerId: "par_pickup",
        vehicleType: "PICKUP_8FT",
        status: "DELIVERED",
        goodsType: "Store inventory",
        weight: 760,
        distance: 22.3,
        fare: 126700,
        createdOffset: -180,
      }),
    ],
    stops: [
      stop("stop_demo_pick", "book_demo", "PICKUP", locations.indiranagar, 1),
      stop("stop_demo_drop", "book_demo", "DROP", locations.koramangala, 2),
      stop("stop_open_ace_pick", "book_open_ace", "PICKUP", locations.hsr, 1),
      stop("stop_open_ace_drop", "book_open_ace", "DROP", locations.electronicCity, 2),
      stop("stop_open_pickup_pick", "book_open_pickup", "PICKUP", locations.peenya, 1),
      stop("stop_open_pickup_drop", "book_open_pickup", "DROP", locations.krMarket, 2),
      stop("stop_transit_pick", "book_transit", "PICKUP", locations.banashankari, 1),
      stop("stop_transit_drop", "book_transit", "DROP", locations.whitefield, 2),
      stop("stop_delivered_pick", "book_delivered", "PICKUP", locations.yeshwanthpur, 1),
      stop("stop_delivered_drop", "book_delivered", "DROP", locations.mgRoad, 2),
    ],
    payments: [
      {
        id: "pay_demo",
        bookingId: "book_demo",
        status: "AUTHORIZED",
        method: "UPI",
        amountCents: 57500,
        provider: "mock",
        providerReference: "mock_pay_demo",
        createdAt: iso(-25),
      },
      {
        id: "pay_open_ace",
        bookingId: "book_open_ace",
        status: "PENDING",
        method: "UPI",
        amountCents: 55800,
        provider: "mock",
        providerReference: null,
        createdAt: iso(-8),
      },
      {
        id: "pay_open_pickup",
        bookingId: "book_open_pickup",
        status: "PENDING",
        method: "CARD",
        amountCents: 110400,
        provider: "mock",
        providerReference: null,
        createdAt: iso(-4),
      },
      {
        id: "pay_transit",
        bookingId: "book_transit",
        status: "AUTHORIZED",
        method: "UPI",
        amountCents: 81700,
        provider: "mock",
        providerReference: "mock_pay_transit",
        createdAt: iso(-52),
      },
      {
        id: "pay_delivered",
        bookingId: "book_delivered",
        status: "CAPTURED",
        method: "UPI",
        amountCents: 126700,
        provider: "mock",
        providerReference: "mock_pay_delivered",
        capturedAt: iso(-120),
        createdAt: iso(-180),
      },
    ],
    trackingEvents: [
      {
        id: "trk_demo",
        bookingId: "book_demo",
        partnerId: "par_demo",
        status: "PARTNER_ASSIGNED",
        lat: locations.mgRoad.lat,
        lng: locations.mgRoad.lng,
        note: "Driver assigned",
        createdAt: iso(-22),
      },
      {
        id: "trk_transit",
        bookingId: "book_transit",
        partnerId: "par_ace",
        status: "IN_TRANSIT",
        lat: 12.9569,
        lng: 77.7011,
        note: "Moving toward drop location",
        createdAt: iso(-12),
      },
      {
        id: "trk_delivered",
        bookingId: "book_delivered",
        partnerId: "par_pickup",
        status: "DELIVERED",
        lat: locations.mgRoad.lat,
        lng: locations.mgRoad.lng,
        note: "Delivery completed",
        createdAt: iso(-118),
      },
    ],
    supportTickets: [],
  };
}

export const db = createDemoData();

export function resetDemoData() {
  const fresh = createDemoData();
  Object.keys(db).forEach((key) => {
    delete db[key];
  });
  Object.assign(db, fresh);
  return db;
}

export function nextId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function fullBooking(booking) {
  return {
    ...booking,
    customer: db.customers.find((customer) => customer.id === booking.customerId),
    partner: db.partners.find((partner) => partner.id === booking.partnerId) || null,
    stops: db.stops.filter((stop) => stop.bookingId === booking.id).sort((a, b) => a.sequence - b.sequence),
    payment: db.payments.find((payment) => payment.bookingId === booking.id) || null,
    trackingEvents: db.trackingEvents.filter((event) => event.bookingId === booking.id),
  };
}

export function createBooking(payload) {
  const weightKg = Number(payload.loadWeightKg);
  const distanceKm = Number(payload.distanceKm);
  const vehicleType = payload.vehicleType || recommendVehicle(weightKg);
  const quote = calculateQuote({ vehicleType, distanceKm, weightKg });
  const booking = {
    id: nextId("book"),
    bookingCode: `LDY-${Math.floor(100000 + Math.random() * 899999)}`,
    customerId: payload.customerId || "cus_demo",
    partnerId: null,
    vehicleType: quote.vehicleType,
    status: "SEARCHING_PARTNER",
    goodsType: payload.goodsType,
    loadWeightKg: weightKg,
    distanceKm,
    quotedFareCents: quote.totalCents,
    finalFareCents: null,
    scheduledAt: payload.scheduledAt || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.bookings.unshift(booking);
  db.stops.push(
    {
      id: nextId("stop"),
      bookingId: booking.id,
      type: "PICKUP",
      address: payload.pickupAddress,
      lat: payload.pickupLat ?? null,
      lng: payload.pickupLng ?? null,
      sequence: 1,
    },
    {
      id: nextId("stop"),
      bookingId: booking.id,
      type: "DROP",
      address: payload.dropAddress,
      lat: payload.dropLat ?? null,
      lng: payload.dropLng ?? null,
      sequence: 2,
    },
  );
  db.payments.push({
    id: nextId("pay"),
    bookingId: booking.id,
    status: "PENDING",
    method: payload.paymentMethod || "UPI",
    amountCents: quote.totalCents,
    provider: "mock",
    providerReference: null,
    createdAt: new Date().toISOString(),
  });
  db.trackingEvents.push({
    id: nextId("trk"),
    bookingId: booking.id,
    partnerId: null,
    status: "SEARCHING_PARTNER",
    lat: payload.pickupLat ?? null,
    lng: payload.pickupLng ?? null,
    note: "Booking created",
    createdAt: new Date().toISOString(),
  });
  return fullBooking(booking);
}
