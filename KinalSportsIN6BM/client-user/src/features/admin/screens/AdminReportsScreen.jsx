import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import GoldButton from "../../../shared/components/ui/GoldButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const AdminReportsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getGeneralStats();
      setStats(res.data?.stats || {});
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  const items = [
    { label: "Total Órdenes", value: stats?.ordenes ?? "N/A" },
    { label: "Total Usuarios", value: stats?.totalUsers ?? "N/A" },
    { label: "Total Restaurantes", value: stats?.restaurantes ?? "N/A" },
    { label: "Total Platos", value: stats?.platillos ?? "N/A" },
    { label: "Total Categorías", value: stats?.totalCategories ?? "N/A" },
    { label: "Ingresos Totales", value: stats?.ingresosTotales ? `Q${stats.ingresosTotales}` : "N/A" },
  ];

  return (
    <ScreenWrapper scroll>
      <Text style={styles.title}>Reportes y Estadísticas</Text>
      <View style={styles.grid}>
        {items.map((item, i) => (
          <Card key={i} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>
      <Text style={styles.hint}>
        Los reportes PDF y Excel se envían por correo desde el panel web.
      </Text>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: { fontFamily: "serif", fontSize: 26, color: COLORS.text, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { width: "47%", minHeight: 100, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 28, color: COLORS.gold, fontWeight: "700" },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" },
  hint: { color: COLORS.textMuted, fontSize: 12, textAlign: "center", marginTop: 24, lineHeight: 18 },
});

export default AdminReportsScreen;