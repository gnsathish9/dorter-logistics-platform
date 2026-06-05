import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DEMO_PARTNER_ID,
  acceptBooking,
  getPartnerJobs,
  updateBookingStatus,
  updatePartnerAvailability,
  updatePartnerLocation,
} from "./src/api";

const fallbackAssigned = [
  {
    id: "book_demo",
    bookingCode: "LDY-4821",
    status: "PARTNER_ASSIGNED",
    vehicleType: "TATA_ACE",
    distanceKm: 11.4,
    quotedFareCents: 57500,
    goodsType: "Retail stock",
    stops: [
      { type: "PICKUP", address: "Indiranagar, Bengaluru" },
      { type: "DROP", address: "Koramangala, Bengaluru" },
    ],
  },
];

const fallbackAvailable = [
  {
    id: "book_open_demo",
    bookingCode: "LDY-4930",
    status: "SEARCHING_PARTNER",
    vehicleType: "TATA_ACE",
    distanceKm: 8.2,
    quotedFareCents: 50800,
    goodsType: "Appliances",
    stops: [
      { type: "PICKUP", address: "BTM Layout, Bengaluru" },
      { type: "DROP", address: "Jayanagar, Bengaluru" },
    ],
  },
];

const statusFlow = {
  PARTNER_ASSIGNED: "ARRIVING",
  ARRIVING: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
  DELIVERED: "DELIVERED",
};

function currency(cents) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round((cents || 0) / 100));
}

function pickup(booking) {
  return booking.stops?.find((stop) => stop.type === "PICKUP")?.address || "Pickup";
}

function drop(booking) {
  return booking.stops?.find((stop) => stop.type === "DROP")?.address || "Drop";
}

export default function App() {
  const [online, setOnline] = useState(true);
  const [assigned, setAssigned] = useState(fallbackAssigned);
  const [available, setAvailable] = useState(fallbackAvailable);
  const [loading, setLoading] = useState(false);
  const [apiMode, setApiMode] = useState("Demo data");
  const [activeTab, setActiveTab] = useState("requests");

  async function refreshJobs() {
    setLoading(true);
    try {
      const data = await getPartnerJobs(DEMO_PARTNER_ID);
      setAssigned(data.assigned);
      setAvailable(data.available);
      setApiMode("Backend connected");
    } catch {
      setApiMode("Demo data");
    } finally {
      setLoading(false);
    }
  }

  async function toggleOnline() {
    const nextOnline = !online;
    setOnline(nextOnline);
    try {
      await updatePartnerAvailability(DEMO_PARTNER_ID, nextOnline ? "ACTIVE" : "OFFLINE");
    } catch {
      Alert.alert("Demo mode", "Availability changed locally. Backend was not reachable.");
    }
  }

  async function accept(job) {
    try {
      const result = await acceptBooking(job.id, DEMO_PARTNER_ID);
      setAvailable((current) => current.filter((item) => item.id !== job.id));
      setAssigned((current) => [result.booking, ...current]);
      Alert.alert("Accepted", `${result.booking.bookingCode} assigned to you.`);
    } catch {
      setAvailable((current) => current.filter((item) => item.id !== job.id));
      setAssigned((current) => [{ ...job, status: "PARTNER_ASSIGNED" }, ...current]);
      Alert.alert("Demo accepted", "Backend was not reachable, so this was accepted in demo state.");
    }
  }

  async function advance(job) {
    const nextStatus = statusFlow[job.status] || "ARRIVING";
    try {
      const result = await updateBookingStatus(job.id, nextStatus);
      setAssigned((current) => current.map((item) => (item.id === job.id ? result.booking : item)));
    } catch {
      setAssigned((current) => current.map((item) => (item.id === job.id ? { ...item, status: nextStatus } : item)));
      Alert.alert("Demo update", "Trip status changed locally. Backend was not reachable.");
    }
  }

  async function sendLocation() {
    try {
      await updatePartnerLocation(DEMO_PARTNER_ID, 12.9716, 77.5946);
      Alert.alert("Location sent", "Live location updated for dispatch and customer tracking.");
    } catch {
      Alert.alert("Demo mode", "Backend was not reachable, but the partner app flow is working.");
    }
  }

  useEffect(() => {
    refreshJobs();
    const timer = setInterval(refreshJobs, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#111820" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Partner app</Text>
            <Text style={styles.title}>Good evening, Ravi</Text>
            <Text style={styles.subtle}>KA01AB1234 | Tata Ace | {apiMode}</Text>
          </View>
          <Pressable onPress={toggleOnline} style={[styles.toggle, online ? styles.online : styles.offline]}>
            <Text style={styles.toggleText}>{online ? "Online" : "Offline"}</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <TabButton label="Requests" active={activeTab === "requests"} onPress={() => setActiveTab("requests")} />
          <TabButton label="Active" active={activeTab === "active"} onPress={() => setActiveTab("active")} />
          <TabButton label="Earnings" active={activeTab === "earnings"} onPress={() => setActiveTab("earnings")} />
        </View>

        <View style={styles.metricsRow}>
          <Metric label="Available" value={available.length.toString()} />
          <Metric label="Assigned" value={assigned.length.toString()} />
          <Metric label="Rating" value="4.9" />
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.locationButton} onPress={sendLocation}>
            <Text style={styles.locationText}>Update location</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={refreshJobs}>
            <Text style={styles.secondaryText}>{loading ? "Loading" : "Refresh"}</Text>
          </Pressable>
        </View>

        {activeTab === "requests" ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>New requests</Text>
          {available.length === 0 ? <Text style={styles.meta}>No open jobs for your vehicle right now.</Text> : null}
          {available.map((job) => (
            <JobCard key={job.id} job={job} actionLabel="Accept" onAction={() => accept(job)} />
          ))}
        </View>
        ) : null}

        {activeTab === "active" ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Assigned jobs</Text>
          {assigned.length === 0 ? <Text style={styles.meta}>No assigned jobs yet.</Text> : null}
          {assigned.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              actionLabel={job.status === "DELIVERED" ? "Done" : "Update"}
              disabled={job.status === "DELIVERED"}
              onAction={() => advance(job)}
            />
          ))}
        </View>
        ) : null}

        {activeTab === "earnings" ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <Text style={styles.meta}>Today: Rs 1,842</Text>
          <Text style={styles.meta}>This week: Rs 8,420</Text>
          <Text style={styles.meta}>Payouts, deductions, cash collection, and settlement history will connect to Supabase payout and payment records.</Text>
        </View>
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

function JobCard({ job, actionLabel, disabled, onAction }) {
  return (
    <View style={styles.jobCard}>
      <View style={styles.jobTop}>
        <Text style={styles.jobId}>{job.bookingCode || job.id}</Text>
        <Text style={styles.status}>{job.status}</Text>
      </View>
      <Text style={styles.route}>{pickup(job)}</Text>
      <Text style={styles.arrow}>to</Text>
      <Text style={styles.route}>{drop(job)}</Text>
      <Text style={styles.meta}>{job.goodsType} | {job.vehicleType} | {job.distanceKm} km</Text>
      <View style={styles.jobBottom}>
        <Text style={styles.fare}>{currency(job.quotedFareCents)}</Text>
        <Pressable disabled={disabled} style={[styles.primaryButton, disabled && styles.disabledButton]} onPress={onAction}>
          <Text style={styles.primaryText}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FA" },
  screen: { gap: 16, padding: 18, paddingBottom: 34 },
  header: {
    backgroundColor: "#111820",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    padding: 18,
  },
  eyebrow: { color: "#F2B84B", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: 6 },
  subtle: { color: "#B8C3CE", marginTop: 6 },
  toggle: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  online: { backgroundColor: "#39A96B" },
  offline: { backgroundColor: "#D95D5D" },
  toggleText: { color: "#FFFFFF", fontWeight: "900" },
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
  tabButtonActive: { backgroundColor: "#0F8B8D" },
  tabText: { color: "#667382", fontWeight: "900" },
  tabTextActive: { color: "#FFFFFF" },
  metricsRow: { flexDirection: "row", gap: 10 },
  metric: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  metricLabel: { color: "#667382", fontSize: 12 },
  metricValue: { color: "#17212B", fontSize: 24, fontWeight: "900", marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 10 },
  locationButton: {
    alignItems: "center",
    backgroundColor: "#0F8B8D",
    borderRadius: 8,
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  locationText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryText: { color: "#17212B", fontWeight: "900" },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  sectionTitle: { color: "#17212B", fontSize: 22, fontWeight: "900" },
  jobCard: {
    backgroundColor: "#FBFCFE",
    borderColor: "#DDE5ED",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  jobTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  jobId: { color: "#17212B", fontWeight: "900" },
  status: {
    backgroundColor: "#E8F6EE",
    borderRadius: 99,
    color: "#207246",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  route: { color: "#17212B", fontSize: 16, fontWeight: "800" },
  arrow: { color: "#667382", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  meta: { color: "#667382", fontSize: 13, lineHeight: 20 },
  jobBottom: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  fare: { color: "#17212B", fontSize: 22, fontWeight: "900" },
  primaryButton: { backgroundColor: "#0F8B8D", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11 },
  disabledButton: { opacity: 0.5 },
  primaryText: { color: "#FFFFFF", fontWeight: "900" },
});
