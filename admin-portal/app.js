const API_BASE = "";
const fallback = {
  totals: { customers: 1, partners: 1, bookings: 1, activeBookings: 1, revenueCents: 0 },
  bookings: [
    {
      bookingCode: "LDY-4821",
      status: "PARTNER_ASSIGNED",
      vehicleType: "TATA_ACE",
      quotedFareCents: 57500,
      stops: [
        { type: "PICKUP", address: "Indiranagar, Bengaluru" },
        { type: "DROP", address: "Koramangala, Bengaluru" },
      ],
      payment: { status: "AUTHORIZED", method: "UPI" },
    },
  ],
  partners: [
    {
      id: "par_demo",
      status: "ACTIVE",
      rating: 4.9,
      totalTrips: 213,
      currentLat: 12.9716,
      currentLng: 77.5946,
      user: { name: "Ravi Kumar", phone: "+919000000002" },
      vehicles: [{ type: "TATA_ACE", plateNumber: "KA01AB1234" }],
      activeBookings: 1,
    },
  ],
  customers: [
    {
      id: "cus_demo",
      companyName: "Demo Retail Store",
      gstNumber: "29ABCDE1234F1Z5",
      user: { name: "Demo Customer", phone: "+919000000001" },
      bookingCount: 1,
      activeBookings: 1,
      paidCents: 0,
    },
  ],
  payments: [{ id: "pay_demo", status: "AUTHORIZED", method: "UPI", amountCents: 57500, provider: "mock" }],
};

function currency(cents) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round((cents || 0) / 100));
}

async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/dashboard`);
    if (!response.ok) throw new Error("API unavailable");
    return response.json();
  } catch {
    return fallback;
  }
}

function render(data) {
  document.querySelector("#customers").textContent = data.totals.customers;
  document.querySelector("#partners").textContent = data.totals.partners;
  document.querySelector("#bookingsCount").textContent = data.totals.bookings;
  document.querySelector("#revenue").textContent = currency(data.totals.revenueCents);
  document.querySelector("#lastUpdated").textContent = `Last updated ${new Date().toLocaleTimeString()}`;
  renderCustomers(data.customers || []);
  renderPartners(data.partners || []);

  const statusFilter = document.querySelector("#statusFilter").value;
  const rows = data.bookings
    .filter((booking) => !statusFilter || booking.status === statusFilter)
    .map((booking) => {
      const pickup = booking.stops?.find((stop) => stop.type === "PICKUP")?.address || "Pickup";
      const drop = booking.stops?.find((stop) => stop.type === "DROP")?.address || "Drop";
      return `
        <tr>
          <td><strong>${booking.bookingCode}</strong></td>
          <td>${pickup} to ${drop}</td>
          <td>${booking.vehicleType}</td>
          <td><span class="badge">${booking.status}</span></td>
          <td>${booking.payment?.method || "-"} / ${booking.payment?.status || "PENDING"}</td>
          <td>${currency(booking.finalFareCents || booking.quotedFareCents)}</td>
        </tr>
      `;
    })
    .join("");
  document.querySelector("#bookingRows").innerHTML = rows;

  document.querySelector("#paymentRows").innerHTML = data.payments
    .map(
      (payment) => `
        <article class="card">
          <strong>${payment.id}</strong>
          <span class="badge">${payment.status}</span>
          <span class="muted">${payment.method} via ${payment.provider}</span>
          <strong>${currency(payment.amountCents)}</strong>
        </article>
      `,
    )
    .join("");
}

function renderCustomers(customers) {
  const query = document.querySelector("#customerSearch").value.trim().toLowerCase();
  const rows = customers
    .filter((customer) => {
      const text = `${customer.user?.name || ""} ${customer.user?.phone || ""} ${customer.companyName || ""}`.toLowerCase();
      return !query || text.includes(query);
    })
    .map(
      (customer) => `
        <tr>
          <td><strong>${customer.user?.name || "-"}</strong></td>
          <td>${customer.user?.phone || "-"}</td>
          <td>${customer.companyName || "-"}</td>
          <td>${customer.gstNumber || "-"}</td>
          <td>${customer.bookingCount || 0}</td>
          <td>${customer.activeBookings || 0}</td>
          <td>${currency(customer.paidCents || 0)}</td>
        </tr>
      `,
    )
    .join("");
  document.querySelector("#customerRows").innerHTML = rows || `<tr><td colspan="7">No customers found</td></tr>`;
}

function renderPartners(partners) {
  const query = document.querySelector("#partnerSearch").value.trim().toLowerCase();
  const rows = partners
    .filter((partner) => {
      const vehicle = partner.vehicles?.[0];
      const text = `${partner.user?.name || ""} ${partner.user?.phone || ""} ${vehicle?.plateNumber || ""} ${partner.status || ""}`.toLowerCase();
      return !query || text.includes(query);
    })
    .map((partner) => {
      const vehicle = partner.vehicles?.[0] || {};
      return `
        <tr>
          <td><strong>${partner.user?.name || partner.id}</strong></td>
          <td>${partner.user?.phone || "-"}</td>
          <td><span class="badge">${partner.status}</span></td>
          <td>${vehicle.type || "-"}</td>
          <td>${vehicle.plateNumber || "-"}</td>
          <td>${partner.totalTrips || 0}</td>
          <td>${partner.activeBookings || 0}</td>
          <td>${partner.currentLat || "-"}, ${partner.currentLng || "-"}</td>
        </tr>
      `;
    })
    .join("");
  document.querySelector("#partnerRows").innerHTML = rows || `<tr><td colspan="8">No partners found</td></tr>`;
}

async function refresh() {
  document.querySelector("#bookingRows").innerHTML = `<tr><td colspan="6">Loading dashboard data...</td></tr>`;
  const data = await loadDashboard();
  window.latestDashboard = data;
  render(data);
}

document.querySelector("#refreshBtn").addEventListener("click", refresh);
document.querySelector("#statusFilter").addEventListener("change", () => render(window.latestDashboard || fallback));
document.querySelector("#customerSearch").addEventListener("input", () => renderCustomers((window.latestDashboard || fallback).customers || []));
document.querySelector("#partnerSearch").addEventListener("input", () => renderPartners((window.latestDashboard || fallback).partners || []));
refresh();
setInterval(refresh, 5000);
