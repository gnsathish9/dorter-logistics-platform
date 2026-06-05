import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createBooking as createBookingApi } from "./src/api";

const vehicles = [
  { id: "bike", name: "Two-wheeler", icon: "2W", capacity: 20, base: 40, perKm: 12, eta: 9 },
  { id: "auto", name: "3-wheeler", icon: "3W", capacity: 500, base: 160, perKm: 24, eta: 14 },
  { id: "ace", name: "Tata Ace", icon: "Ace", capacity: 750, base: 210, perKm: 29, eta: 18 },
  { id: "pickup", name: "Pickup 8ft", icon: "8ft", capacity: 1200, base: 300, perKm: 38, eta: 24 },
  { id: "407", name: "Tata 407", icon: "407", capacity: 2500, base: 625, perKm: 55, eta: 32 },
];

const drivers = ["Ravi K.", "Aman S.", "Nikhil P.", "Farah M.", "Joel D."];

const initialBookings = [
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

const goodsOptions = ["Retail", "Appliances", "Shifting"];
const scheduleOptions = ["Now", "Evening", "Tomorrow"];
const apiVehicleType = {
  bike: "TWO_WHEELER",
  auto: "THREE_WHEELER",
  ace: "TATA_ACE",
  pickup: "PICKUP_8FT",
  "407": "TATA_407",
};

const locationPresets = {
  "Indiranagar, Bengaluru": { lat: 12.9784, lng: 77.6408 },
  "Koramangala, Bengaluru": { lat: 12.9352, lng: 77.6245 },
  "HSR Layout, Bengaluru": { lat: 12.9116, lng: 77.6474 },
  "Electronic City, Bengaluru": { lat: 12.8452, lng: 77.6602 },
  "Peenya Industrial Area": { lat: 13.0285, lng: 77.5197 },
  "KR Market": { lat: 12.9614, lng: 77.5761 },
  "Whitefield, Bengaluru": { lat: 12.9698, lng: 77.7499 },
  "MG Road, Bengaluru": { lat: 12.9758, lng: 77.609 },
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateFare(vehicle, distance, weight) {
  const handling = weight > 500 ? 120 : weight > 100 ? 60 : 0;
  return vehicle.base + Math.ceil(distance * vehicle.perKm) + handling;
}

function bestVehicle(weight) {
  return vehicles.find((vehicle) => vehicle.capacity >= weight) || vehicles[vehicles.length - 1];
}

export default function App() {
  const [pickup, setPickup] = useState("Indiranagar, Bengaluru");
  const [drop, setDrop] = useState("Koramangala, Bengaluru");
  const [distance, setDistance] = useState("9");
  const [weight, setWeight] = useState("45");
  const [goods, setGoods] = useState("Retail");
  const [schedule, setSchedule] = useState("Now");
  const [selectedVehicleId, setSelectedVehicleId] = useState("ace");
  const [bookings, setBookings] = useState(initialBookings);
  const [apiMode, setApiMode] = useState("Ready");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("book");

  const numericDistance = Math.max(Number(distance) || 1, 1);
  const numericWeight = Math.max(Number(weight) || 1, 1);

  const recommendation = useMemo(() => bestVehicle(numericWeight), [numericWeight]);
  const selectedVehicle = useMemo(() => {
    const current = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
    if (!current || current.capacity < numericWeight) {
      return recommendation;
    }
    return current;
  }, [numericWeight, recommendation, selectedVehicleId]);

  const fare = calculateFare(selectedVehicle, numericDistance, numericWeight);

  async function confirmBooking() {
    if (!pickup.trim() || !drop.trim()) {
      Alert.alert("Missing route", "Add pickup and drop locations to continue.");
      return;
    }

    const localBooking = {
      id: `LDY-${Math.floor(5000 + Math.random() * 4000)}`,
      route: `${pickup.trim()} to ${drop.trim()}`,
      vehicle: selectedVehicle.name,
      driver: drivers[Math.floor(Math.random() * drivers.length)],
      fare,
      status: schedule === "Now" ? "Searching driver" : "Scheduled",
    };

    setSubmitting(true);
    const pickupLocation = locationPresets[pickup.trim()];
    const dropLocation = locationPresets[drop.trim()];
    try {
      const result = await createBookingApi({
        pickupAddress: pickup.trim(),
        dropAddress: drop.trim(),
        goodsType: goods,
        loadWeightKg: numericWeight,
        distanceKm: numericDistance,
        pickupLat: pickupLocation?.lat,
        pickupLng: pickupLocation?.lng,
        dropLat: dropLocation?.lat,
        dropLng: dropLocation?.lng,
        vehicleType: apiVehicleType[selectedVehicle.id],
        paymentMethod: "UPI",
      });
      setBookings([
        {
          ...localBooking,
          id: result.booking.bookingCode,
          status: result.booking.status,
          fare: Math.round(result.booking.quotedFareCents / 100),
        },
        ...bookings,
      ]);
      setApiMode("Backend connected");
      Alert.alert("Booking created", `${selectedVehicle.name} selected for ${currency(fare)}.`);
    } catch {
      setBookings([localBooking, ...bookings]);
      setApiMode("Demo mode");
      Alert.alert("Demo booking created", "Backend is not reachable, so this booking was saved in the app demo state.");
    } finally {
      setSubmitting(false);
    }
  }

  function loadBulkDemo() {
    setPickup("Peenya Industrial Area");
    setDrop("KR Market");
    setDistance("18");
    setWeight("900");
    setGoods("Retail");
    setSchedule("Now");
    setSelectedVehicleId("pickup");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>L</Text>
            </View>
            <View>
              <Text style={styles.brand}>Loadly</Text>
              <Text style={styles.muted}>City logistics | {apiMode}</Text>
            </View>
          </View>
          <Pressable style={styles.supportButton}>
            <Text style={styles.supportText}>Support</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <TabButton label="Book" active={activeTab === "book"} onPress={() => setActiveTab("book")} />
          <TabButton label="Trips" active={activeTab === "trips"} onPress={() => setActiveTab("trips")} />
          <TabButton label="Account" active={activeTab === "account"} onPress={() => setActiveTab("account")} />
        </View>

        {activeTab === "book" ? (
          <>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Instant goods delivery</Text>
            <Text style={styles.title}>Book a truck, bike, or van in minutes.</Text>
            <Text style={styles.subtitle}>Transparent fares, nearby partners, and live booking status.</Text>
          </View>
          <View style={styles.mapCard}>
            <View style={styles.routeLine} />
            <View style={[styles.pin, styles.pickupPin]}>
              <Text style={styles.pinText}>Pickup</Text>
            </View>
            <View style={[styles.pin, styles.dropPin]}>
              <Text style={styles.pinText}>Drop</Text>
            </View>
            <View style={styles.mapStat}>
              <Text style={styles.muted}>Avg pickup</Text>
              <Text style={styles.mapStatValue}>18 min</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Book now</Text>
          <Text style={styles.sectionTitle}>Delivery details</Text>

          <Text style={styles.label}>Pickup location</Text>
          <TextInput value={pickup} onChangeText={setPickup} style={styles.input} placeholder="Enter pickup" />

          <Text style={styles.label}>Drop location</Text>
          <TextInput value={drop} onChangeText={setDrop} style={styles.input} placeholder="Enter drop" />

          <View style={styles.twoColumn}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Distance km</Text>
              <TextInput
                value={distance}
                onChangeText={setDistance}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight kg</Text>
              <TextInput value={weight} onChangeText={setWeight} style={styles.input} keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.label}>Goods type</Text>
          <View style={styles.chips}>
            {goodsOptions.map((option) => (
              <Chip key={option} label={option} active={goods === option} onPress={() => setGoods(option)} />
            ))}
          </View>

          <Text style={styles.label}>Pickup time</Text>
          <View style={styles.chips}>
            {scheduleOptions.map((option) => (
              <Chip key={option} label={option} active={schedule === option} onPress={() => setSchedule(option)} />
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Recommended vehicle</Text>
          <Text style={styles.sectionTitle}>{recommendation.name}</Text>
          <View style={styles.vehicleGrid}>
            {vehicles.map((vehicle) => {
              const disabled = vehicle.capacity < numericWeight;
              const selected = vehicle.id === selectedVehicle.id;
              return (
                <Pressable
                  key={vehicle.id}
                  disabled={disabled}
                  onPress={() => setSelectedVehicleId(vehicle.id)}
                  style={[styles.vehicleCard, selected && styles.vehicleSelected, disabled && styles.disabledCard]}
                >
                  <View style={styles.vehicleIcon}>
                    <Text style={styles.vehicleIconText}>{vehicle.icon}</Text>
                  </View>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Text style={styles.vehicleMeta}>{vehicle.capacity} kg | {vehicle.eta} min</Text>
                  <Text style={styles.vehicleFare}>
                    {disabled ? "Too small" : currency(calculateFare(vehicle, numericDistance, numericWeight))}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fareBox}>
            <Text style={styles.fareLabel}>Estimated fare</Text>
            <Text style={styles.fare}>{currency(fare)}</Text>
            <Text style={styles.fareNote}>
              {numericDistance} km, {numericWeight} kg, {selectedVehicle.eta} min pickup estimate.
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={confirmBooking}>
            <Text style={styles.primaryText}>{submitting ? "Booking..." : "Confirm booking"}</Text>
          </Pressable>
        </View>
          </>
        ) : null}

        {activeTab === "trips" ? (
        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.eyebrow}>Live operations</Text>
              <Text style={styles.sectionTitle}>Tracking board</Text>
            </View>
            <Pressable style={styles.smallButton} onPress={loadBulkDemo}>
              <Text style={styles.smallButtonText}>Bulk demo</Text>
            </Pressable>
          </View>
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingTop}>
                <Text style={styles.bookingId}>{booking.id}</Text>
                <Text style={styles.status}>{booking.status}</Text>
              </View>
              <Text style={styles.bookingRoute}>{booking.route}</Text>
              <Text style={styles.muted}>{booking.vehicle} assigned to {booking.driver}</Text>
              <Text style={styles.bookingFare}>{currency(booking.fare)}</Text>
            </View>
          ))}
        </View>
        ) : null}

        {activeTab === "account" ? (
          <>
        <View style={styles.metricsRow}>
          <Metric label="Drivers" value="32" note="Nearby" />
          <Metric label="On-time" value="94%" note="7 days" />
          <Metric label="Orders" value="128" note="This week" />
        </View>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Customer profile</Text>
          <Text style={styles.sectionTitle}>Demo Customer</Text>
          <Text style={styles.muted}>Phone OTP login, saved addresses, GST billing, wallet, and support tickets will connect to Supabase auth and profile tables.</Text>
        </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Metric({ label, value, note }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.muted}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  screen: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 6,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#0F8B8D",
  },
  tabText: {
    color: "#667382",
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  logo: {
    alignItems: "center",
    backgroundColor: "#F2B84B",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  logoText: {
    color: "#17212B",
    fontSize: 22,
    fontWeight: "900",
  },
  brand: {
    color: "#17212B",
    fontSize: 20,
    fontWeight: "900",
  },
  muted: {
    color: "#667382",
    fontSize: 13,
  },
  supportButton: {
    backgroundColor: "#EAF2FF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  supportText: {
    color: "#17212B",
    fontWeight: "800",
  },
  hero: {
    gap: 16,
  },
  heroCopy: {
    gap: 8,
  },
  eyebrow: {
    color: "#0F8B8D",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#17212B",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#667382",
    fontSize: 15,
    lineHeight: 22,
  },
  mapCard: {
    backgroundColor: "#E7F5F4",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    height: 210,
    overflow: "hidden",
    position: "relative",
  },
  routeLine: {
    backgroundColor: "#0F8B8D",
    borderRadius: 99,
    height: 8,
    left: 42,
    position: "absolute",
    right: 42,
    top: 112,
    transform: [{ rotate: "-12deg" }],
  },
  pin: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute",
    shadowColor: "#17212B",
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  pickupPin: {
    left: 24,
    top: 72,
  },
  dropPin: {
    bottom: 42,
    right: 28,
  },
  pinText: {
    color: "#17212B",
    fontWeight: "900",
  },
  mapStat: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 8,
    padding: 14,
    position: "absolute",
    right: 18,
    top: 18,
  },
  mapStatValue: {
    color: "#17212B",
    fontSize: 26,
    fontWeight: "900",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#17212B",
    fontSize: 24,
    fontWeight: "900",
  },
  label: {
    color: "#3B4652",
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#FBFCFE",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    color: "#17212B",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#FBFCFE",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: "#E7F5F4",
    borderColor: "#0F8B8D",
  },
  chipText: {
    color: "#3B4652",
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#0B686A",
  },
  vehicleGrid: {
    gap: 10,
  },
  vehicleCard: {
    backgroundColor: "#FBFCFE",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  vehicleSelected: {
    backgroundColor: "#F0FBFA",
    borderColor: "#0F8B8D",
  },
  disabledCard: {
    opacity: 0.45,
  },
  vehicleIcon: {
    alignItems: "center",
    backgroundColor: "#111820",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 54,
  },
  vehicleIconText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  vehicleName: {
    color: "#17212B",
    fontSize: 16,
    fontWeight: "900",
  },
  vehicleMeta: {
    color: "#667382",
    fontSize: 13,
  },
  vehicleFare: {
    color: "#17212B",
    fontWeight: "900",
  },
  fareBox: {
    backgroundColor: "#111820",
    borderRadius: 8,
    gap: 4,
    padding: 16,
  },
  fareLabel: {
    color: "#B8C3CE",
    fontSize: 13,
  },
  fare: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
  },
  fareNote: {
    color: "#B8C3CE",
    fontSize: 13,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0F8B8D",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  smallButton: {
    backgroundColor: "#EAF2FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  smallButtonText: {
    color: "#17212B",
    fontWeight: "900",
  },
  bookingCard: {
    backgroundColor: "#FBFCFE",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  bookingTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  bookingId: {
    color: "#17212B",
    fontWeight: "900",
  },
  status: {
    backgroundColor: "#E8F6EE",
    borderRadius: 99,
    color: "#207246",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  bookingRoute: {
    color: "#17212B",
    fontSize: 15,
    fontWeight: "700",
  },
  bookingFare: {
    color: "#17212B",
    fontSize: 18,
    fontWeight: "900",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metric: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  metricValue: {
    color: "#17212B",
    fontSize: 26,
    fontWeight: "900",
  },
});
