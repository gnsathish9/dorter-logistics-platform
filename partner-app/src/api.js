// For Expo Go on a real phone, replace localhost with your computer LAN IP.
// Example: "http://192.168.1.20:4000"
export const API_BASE_URL = "http://192.168.1.9:4000";
export const DEMO_PARTNER_ID = "par_demo";

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function getPartnerJobs(partnerId = DEMO_PARTNER_ID) {
  return request(`/api/partners/${partnerId}/jobs`);
}

export function acceptBooking(bookingId, partnerId = DEMO_PARTNER_ID) {
  return request(`/api/bookings/${bookingId}/accept`, {
    method: "POST",
    body: JSON.stringify({ partnerId }),
  });
}

export function updateBookingStatus(bookingId, status) {
  return request(`/api/bookings/${bookingId}/status`, {
    method: "POST",
    body: JSON.stringify({ status, note: "Updated from partner app" }),
  });
}

export function updatePartnerAvailability(partnerId, status) {
  return request(`/api/partners/${partnerId}/availability`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function updatePartnerLocation(partnerId, lat, lng) {
  return request(`/api/partners/${partnerId}/location`, {
    method: "POST",
    body: JSON.stringify({ lat, lng }),
  });
}
