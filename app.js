const vehicles = [
  { id: "bike", name: "Two-wheeler", icon: "2W", capacity: 20, base: 40, perKm: 12, eta: 9 },
  { id: "auto", name: "3-wheeler", icon: "3W", capacity: 500, base: 160, perKm: 24, eta: 14 },
  { id: "ace", name: "Tata Ace", icon: "Ace", capacity: 750, base: 210, perKm: 29, eta: 18 },
  { id: "pickup", name: "Pickup 8ft", icon: "8ft", capacity: 1200, base: 300, perKm: 38, eta: 24 },
  { id: "407", name: "Tata 407", icon: "407", capacity: 2500, base: 625, perKm: 55, eta: 32 },
];

const drivers = ["Ravi K.", "Aman S.", "Nikhil P.", "Farah M.", "Joel D."];
const bookings = [
  {
    id: "LDY-4821",
    route: "MG Road to Whitefield",
    vehicle: "Pickup 8ft",
    driver: "Farah M.",
    fare: 742,
    status: "On the way",
  },
  {
    id: "LDY-4819",
    route: "BTM Layout to Jayanagar",
    vehicle: "Two-wheeler",
    driver: "Ravi K.",
    fare: 164,
    status: "Arriving",
  },
];

let selectedVehicleId = "ace";

const form = document.querySelector("#bookingForm");
const vehicleOptions = document.querySelector("#vehicleOptions");
const fareTotal = document.querySelector("#fareTotal");
const fareBreakdown = document.querySelector("#fareBreakdown");
const recommendedVehicle = document.querySelector("#recommendedVehicle");
const bookingList = document.querySelector("#bookingList");

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getFormValues() {
  const data = new FormData(form);
  return {
    pickup: data.get("pickup"),
    drop: data.get("drop"),
    distance: Number(data.get("distance") || 1),
    weight: Number(data.get("weight") || 1),
    goods: data.get("goods"),
    schedule: data.get("schedule"),
  };
}

function calculateFare(vehicle, distance, weight) {
  const handling = weight > 500 ? 120 : weight > 100 ? 60 : 0;
  const distanceFare = Math.ceil(distance * vehicle.perKm);
  return vehicle.base + distanceFare + handling;
}

function bestVehicle(weight) {
  return vehicles.find((vehicle) => vehicle.capacity >= weight) || vehicles[vehicles.length - 1];
}

function renderVehicles() {
  const values = getFormValues();
  const recommended = bestVehicle(values.weight);

  if (!vehicles.some((vehicle) => vehicle.id === selectedVehicleId && vehicle.capacity >= values.weight)) {
    selectedVehicleId = recommended.id;
  }

  recommendedVehicle.textContent = recommended.name;
  vehicleOptions.innerHTML = "";

  vehicles.forEach((vehicle) => {
    const fare = calculateFare(vehicle, values.distance, values.weight);
    const disabled = vehicle.capacity < values.weight;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `vehicle-card ${vehicle.id === selectedVehicleId ? "selected" : ""}`;
    card.disabled = disabled;
    card.innerHTML = `
      <span class="vehicle-icon">${vehicle.icon}</span>
      <strong>${vehicle.name}</strong>
      <span class="vehicle-meta"><span>${vehicle.capacity} kg</span><span>${vehicle.eta} min</span></span>
      <span>${disabled ? "Too small" : currency(fare)}</span>
    `;
    card.addEventListener("click", () => {
      selectedVehicleId = vehicle.id;
      renderVehicles();
    });
    vehicleOptions.appendChild(card);
  });

  const selected = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
  const fare = calculateFare(selected, values.distance, values.weight);
  fareTotal.textContent = currency(fare);
  fareBreakdown.textContent = `${values.distance} km, ${values.weight} kg, ${selected.eta} min pickup estimate.`;
}

function renderBookings() {
  bookingList.innerHTML = "";
  bookings.forEach((booking) => {
    const item = document.createElement("article");
    item.className = "booking-item";
    item.innerHTML = `
      <header>
        <strong>${booking.id}</strong>
        <span class="status">${booking.status}</span>
      </header>
      <span>${booking.route}</span>
      <small>${booking.vehicle} assigned to ${booking.driver}</small>
      <strong>${currency(booking.fare)}</strong>
    `;
    bookingList.appendChild(item);
  });
}

form.addEventListener("input", renderVehicles);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = getFormValues();
  const vehicle = vehicles.find((item) => item.id === selectedVehicleId);
  bookings.unshift({
    id: `LDY-${Math.floor(5000 + Math.random() * 4000)}`,
    route: `${values.pickup} to ${values.drop}`,
    vehicle: vehicle.name,
    driver: drivers[Math.floor(Math.random() * drivers.length)],
    fare: calculateFare(vehicle, values.distance, values.weight),
    status: values.schedule === "Now" ? "Searching driver" : "Scheduled",
  });
  renderBookings();
  document.querySelector("#track").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#newBookingBtn").addEventListener("click", () => {
  document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#bulkDemoBtn").addEventListener("click", () => {
  document.querySelector("#weight").value = 900;
  document.querySelector("#distance").value = 18;
  document.querySelector("#pickup").value = "Peenya Industrial Area";
  document.querySelector("#drop").value = "KR Market";
  selectedVehicleId = "pickup";
  renderVehicles();
  document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
});

renderVehicles();
renderBookings();
