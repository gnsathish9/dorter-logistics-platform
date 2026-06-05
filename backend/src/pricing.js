export const vehicleCatalog = {
  TWO_WHEELER: { label: "Two-wheeler", capacityKg: 20, baseFare: 40, perKm: 12, etaMinutes: 9 },
  THREE_WHEELER: { label: "3-wheeler", capacityKg: 500, baseFare: 160, perKm: 24, etaMinutes: 14 },
  TATA_ACE: { label: "Tata Ace", capacityKg: 750, baseFare: 210, perKm: 29, etaMinutes: 18 },
  PICKUP_8FT: { label: "Pickup 8ft", capacityKg: 1200, baseFare: 300, perKm: 38, etaMinutes: 24 },
  TATA_407: { label: "Tata 407", capacityKg: 2500, baseFare: 625, perKm: 55, etaMinutes: 32 },
};

export function cents(value) {
  return Math.round(value * 100);
}

export function rupees(valueInCents) {
  return Math.round(valueInCents / 100);
}

export function recommendVehicle(weightKg) {
  const entry = Object.entries(vehicleCatalog).find(([, vehicle]) => vehicle.capacityKg >= weightKg);
  return entry ? entry[0] : "TATA_407";
}

export function calculateQuote({ vehicleType, distanceKm, weightKg }) {
  const vehicle = vehicleCatalog[vehicleType || recommendVehicle(weightKg)];
  const baseFareCents = cents(vehicle.baseFare);
  const distanceCents = cents(Math.ceil(distanceKm * vehicle.perKm));
  const handlingCents = cents(weightKg > 500 ? 120 : weightKg > 100 ? 60 : 0);
  const subtotalCents = baseFareCents + distanceCents + handlingCents;
  const taxCents = cents(rupees(subtotalCents) * 0.05);
  return {
    vehicle,
    vehicleType: vehicleType || recommendVehicle(weightKg),
    baseFareCents,
    distanceCents,
    handlingCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}
