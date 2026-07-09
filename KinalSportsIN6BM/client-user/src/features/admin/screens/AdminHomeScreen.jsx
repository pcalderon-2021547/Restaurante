import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const AdminHomeScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, topRes] = await Promise.all([
          restaurantService.getGeneralStats().catch(() => ({ data: { stats: {} } })),
          restaurantService.getOrders().catch(() => ({ data: { orders: [] } })),
          restaurantService.getTopDishes(5).catch(() => ({ data: { topDishes: [] } })),
        ]);
        setStats({
          ...statsRes.data?.stats,
          orders: ordersRes.data?.orders || [],
          topDishes: topRes.data?.topDishes || [],
        });
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const metrics = [
    { label: "Órdenes Totales", value: stats?.orders?.length || 0 },
    { label: "Platos Vendidos", value: stats?.topDishes?.reduce((s, d) => s + (d.totalVendido || 0), 0) || 0 },
    { label: "Ingresos", value: `Q${stats?.orders?.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)}` },
    { label: "Platos distintos", value: stats?.topDishes?.length || 0 },
  ];

  return (
    <ScreenWrapper scroll>
      <Text style={styles.title}>Panel de Administración</Text>
      <View style={styles.grid}>
        {metrics.map((m, i) => (
          <Card key={i} style={styles.metricCard}>
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </Card>
        ))}
      </View>

      {stats?.topDishes?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Top Platos</Text>
          {stats.topDishes.map((d, i) => (
            <Card key={i} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.dishName}>{i + 1}. {d.name || d._id}</Text>
                <Text style={styles.dishSold}>{d.totalVendido || 0} vendidos</Text>
              </View>
            </Card>
          ))}
        </>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: { fontFamily: "serif", fontSize: 26, color: COLORS.text, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  metricCard: { width: "47%", minHeight: 100, justifyContent: "center", alignItems: "center" },
  metricValue: { fontSize: 24, color: COLORS.gold, fontWeight: "700" },
  metricLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 },
  sectionTitle: { fontSize: 16, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  dishName: { fontSize: 14, color: COLORS.text, fontWeight: "600" },
  dishSold: { fontSize: 13, color: COLORS.gold, fontWeight: "700" },
});

export default AdminHomeScreen;