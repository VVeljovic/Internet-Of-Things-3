import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { io } from "socket.io-client";
import { fetchData } from "./api";
import { Measurement } from "./Measurement";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH  = SCREEN_WIDTH - 48;

const HISTORY_ACC = {
  x: [0.10, 0.18, 0.25, 0.42, 0.38, 0.51, 0.44, 0.60, 0.55, 0.42].map((v) => ({ value: v })),
  y: [-0.20, -0.35, -0.50, -0.70, -0.87, -0.75, -0.60, -0.80, -0.90, -0.87].map((v) => ({ value: v })),
  z: [9.60, 9.65, 9.71, 9.75, 9.81, 9.78, 9.80, 9.82, 9.79, 9.81].map((v) => ({ value: v })),
};

const CURRENT = {
  acc: { x: 0.42, y: -0.87, z: 9.81 },
  lastUpdate: "02.03.2026. 14:32:08",
};

const AXIS_COLORS = { x: "#38bdf8", y: "#a78bfa", z: "#4ade80" };

function intensityColor(value: number, max: number): string {
  const ratio = Math.abs(value) / max;
  if (ratio < 0.3)  return "#4ade80";
  if (ratio < 0.75) return "#facc15";
  return "#f87171";
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      <View style={s.divider} />
      {children}
    </View>
  );
}

function ValueBadge({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={s.badge}>
      <Text style={[s.badgeLabel, { color }]}>{label}</Text>
      <Text style={s.badgeValue}>
        {value >= 0 ? "+" : ""}
        {value.toFixed(3)}
      </Text>
      <Text style={s.badgeUnit}>{unit}</Text>
    </View>
  );
}

function ChartLegend() {
  return (
    <View style={s.legend}>
      {(["x", "y", "z"] as const).map((axis) => (
        <View key={axis} style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: AXIS_COLORS[axis] }]} />
          <Text style={s.legendText}>{axis.toUpperCase()} os</Text>
        </View>
      ))}
    </View>
  );
}

export default function Index() {
  const { acc } = CURRENT;

  const [measurements, setMeasurements] = useState<Measurement[]>([]);


  useEffect(() => {
    console.log('a')
    const socket = io('http://127.0.0.1:5000', {
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Povezan na server');
    });

    socket.on('new-data', (data) => {
        console.log(data);
    });

    return () => {
        socket.disconnect();
    };
}, []);

  useEffect(() => {
    
    const load = async () => {
      const data = await fetchData();
      setMeasurements(data);
      console.log(data);
    };
    load();
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>IoT Dashboard</Text>
          <Text style={s.subtitle}>Senzorski modul v1.0</Text>
        </View>
        <View style={s.statusBadge}>
          <View style={s.statusDot} />
          <Text style={s.statusText}>Povezan</Text>
        </View>
      </View>

      {/* Akcelerometar */}
      <Card title="Akcelerometar">
        <LineChart
          data={HISTORY_ACC.x}
          data2={HISTORY_ACC.y}
          data3={HISTORY_ACC.z}
          color1={AXIS_COLORS.x}
          color2={AXIS_COLORS.y}
          color3={AXIS_COLORS.z}
          thickness={2}
          dataPointsRadius={3}
          dataPointsColor1={AXIS_COLORS.x}
          dataPointsColor2={AXIS_COLORS.y}
          dataPointsColor3={AXIS_COLORS.z}
          width={CHART_WIDTH - 32}
          height={140}
          backgroundColor="#0f172a"
          xAxisColor="#334155"
          yAxisColor="#334155"
          yAxisTextStyle={{ color: "#64748b", fontSize: 10 }}
          xAxisLabelTextStyle={{ color: "#64748b", fontSize: 9 }}
          rulesColor="#1e3a5f"
          rulesType="solid"
          hideDataPoints={false}
          curved
          noOfSections={4}
          adjustToWidth
          initialSpacing={8}
          spacing={CHART_WIDTH / 12}
        />

        <ChartLegend />

        <View style={s.badgeRow}>
          <ValueBadge label="X" value={acc.x} unit="m/s²" color={intensityColor(acc.x, 10)} />
          <ValueBadge label="Y" value={acc.y} unit="m/s²" color={intensityColor(acc.y, 10)} />
          <ValueBadge label="Z" value={acc.z} unit="m/s²" color={intensityColor(acc.z, 10)} />
        </View>
      </Card>

      <Text style={s.footer}>Poslednje ažuriranje: {CURRENT.lastUpdate}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 48 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  title:    { fontSize: 24, fontWeight: "bold", color: "#f1f5f9" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" },
  statusText: { color: "#4ade80", fontSize: 13, fontWeight: "600" },

  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: "#334155", marginBottom: 14 },

  legend: { flexDirection: "row", gap: 16, marginTop: 10, marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: "#94a3b8", fontSize: 12 },

  badgeRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  badge: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  badgeLabel: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  badgeValue: { fontSize: 15, fontWeight: "700", color: "#e2e8f0" },
  badgeUnit:  { fontSize: 10, color: "#64748b", marginTop: 2 },

  footer: {
    textAlign: "center",
    color: "#475569",
    fontSize: 11,
    marginTop: 8,
  },
});
