import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const RANK_ICONS = ["trophy-outline", "trophy-outline", "trophy-outline"];
const RANK_COLORS = [COLORS.warning, "#a0a0a0", "#cd7f32"];

const MetricCard = ({ icon, value, label, color, delay }) => {
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [15, 0] });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], width: "48%" }}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.warmDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.metricCard}
      >
        <View style={[styles.metricIconWrap, { backgroundColor: color + "15" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const AdminHomeScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const totalOrders = stats?.orders?.length || 0;
  const totalSold = stats?.topDishes?.reduce((s, d) => s + (d.totalVendido || 0), 0) || 0;
  const totalRevenue = stats?.orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;

  const metrics = [
    { icon: "cash-outline", value: `Q${totalRevenue.toFixed(0)}`, label: "Ingresos", color: COLORS.gold },
    { icon: "receipt-outline", value: totalOrders, label: "Órdenes", color: COLORS.info },
    { icon: "cart-outline", value: totalSold, label: "Platos vendidos", color: COLORS.success },
    { icon: "restaurant-outline", value: stats?.topDishes?.length || 0, label: "Platos distintos", color: COLORS.warning },
  ];

  const topDishes = stats?.topDishes || [];

  return (
    <ScreenWrapper scroll>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      >
        <LinearGradient
          colors={[COLORS.charcoal, COLORS.obsidian]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerAccent}>
            <View style={styles.headerIcon}>
              <Ionicons name="stats-chart-outline" size={26} color={COLORS.gold} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Resumen General</Text>
              <Text style={styles.headerSub}>Panel del restaurante</Text>
            </View>
          </View>
          <View style={styles.headerLine} />
        </LinearGradient>

        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <MetricCard key={m.label} {...m} delay={i * 80} />
          ))}
        </View>

        {topDishes.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy-outline" size={18} color={COLORS.gold} />
              <Text style={styles.sectionTitle}>Top Platos</Text>
              <Text style={styles.sectionBadge}>Más vendidos</Text>
            </View>

            {topDishes.map((d, i) => {
              const maxSold = topDishes[0]?.totalVendido || 1;
              const barWidth = (d.totalVendido / maxSold) * 100;
              const isPodium = i < 3;

              return (
                <LinearGradient
                  key={d._id || i}
                  colors={isPodium ? ["rgba(201,168,76,0.06)", "transparent"] : ["transparent", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dishRow}
                >
                  <View style={[styles.rankBadge, isPodium && { backgroundColor: RANK_COLORS[i] + "20", borderColor: RANK_COLORS[i] }]}>
                    {isPodium ? (
                      <Ionicons name={RANK_ICONS[i]} size={16} color={RANK_COLORS[i]} />
                    ) : (
                      <Text style={styles.rankNum}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>{d.name || d._id}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: isPodium ? COLORS.gold : COLORS.textMuted }]} />
                    </View>
                  </View>
                  <View style={styles.dishCount}>
                    <Text style={[styles.dishNumber, isPodium && { color: COLORS.gold }]}>{d.totalVendido || 0}</Text>
                    <Text style={styles.dishUnit}>vendidos</Text>
                  </View>
                </LinearGradient>
              );
            })}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { marginHorizontal: -16, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, marginTop: -16 },
  headerAccent: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: "rgba(201,168,76,0.1)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(201,168,76,0.2)",
  },
  headerTitle: { fontFamily: "serif", fontSize: 24, color: COLORS.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  headerLine: { height: 1, backgroundColor: "rgba(201,168,76,0.12)", marginTop: 16 },

  metricsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20,
  },
  metricCard: {
    padding: 16, borderRadius: 14, borderWidth: 1,
    borderColor: COLORS.borderLight, ...SHADOWS.sm,
  },
  metricIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  metricValue: {
    fontFamily: "serif", fontSize: 22, fontWeight: "700", color: COLORS.text,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 10, color: COLORS.textMuted, marginTop: 2,
    textTransform: "uppercase", letterSpacing: 1.2, fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 24, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15, color: COLORS.gold, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 1.2,
  },
  sectionBadge: {
    fontSize: 9, color: COLORS.textMuted, backgroundColor: "rgba(201,168,76,0.08)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600",
  },

  dishRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  rankBadge: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  rankNum: { fontSize: 13, color: COLORS.textMuted, fontWeight: "700" },
  dishInfo: { flex: 1, gap: 6 },
  dishName: { fontSize: 14, color: COLORS.text, fontWeight: "600" },
  barBg: { height: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2 },
  dishCount: { alignItems: "center", minWidth: 50 },
  dishNumber: { fontSize: 16, fontWeight: "700", color: COLORS.text, letterSpacing: -0.5 },
  dishUnit: { fontSize: 8, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
});

export default AdminHomeScreen;