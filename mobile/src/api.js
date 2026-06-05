// For Expo Go on a real phone, replace localhost with your computer LAN IP.
// Example: "http://192.168.1.20:4000"
export const API_BASE_URL = "http://192.168.1.9:4000";

export async function createBooking(payload) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to create booking");
  }

  return response.json();
}

export async function getVehicleCatalog() {
  const response = await fetch(`${API_BASE_URL}/api/catalog/vehicles`);
  if (!response.ok) {
    throw new Error("Unable to load vehicles");
  }
  return response.json();
}
