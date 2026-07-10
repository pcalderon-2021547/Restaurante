import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/Common";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminRestaurants } from "../hooks/useAdminRestaurants";
import * as restaurantService from "../../../shared/api/restaurantService";

const MENU_ITEMS = [
  { key: "UsersList", icon: "people-outline", title: "Usuarios", desc: "Gestión de usuarios", color: "#7eb8f7" },
  { key: "RestaurantsList", icon: "storefront-outline", title: "Restaurantes", desc: "Gestionar restaurantes", color: "#e8c96e" },
  { key: "AdminOrders", icon: "receipt-outline", title: "Pedidos", desc: "Órdenes y entregas", color: "#34d399" },
  { key: "AdminProducts", icon: "cube-outline", title: "Productos", desc: "Inventario y stock", color: "#e0a85a" },
  { key: "AdminDishes", icon: "restaurant-outline", title: "Platillos", desc: "Menú de platos", color: "#e05a5a" },
  { key: "AdminCategories", icon: "pricetags-outline", title: "Categorías", desc: "Categorías de platos", color: "#a78bfa" },
  { key: "AdminMenus", icon: "book-outline", title: "Menús", desc: "Combos y promociones", color: "#f472b6" },
  { key: "AdminTables", icon: "grid-outline", title: "Mesas", desc: "Gestión de mesas", color: "#2dd4bf" },
  { key: "AdminEvents", icon: "calendar-outline", title: "Eventos", desc: "Eventos especiales", color: "#fb923c" },
  { key: "AdminReservations", icon: "clipboard-outline", title: "Reservaciones", desc: "Todas las reservas", color: "#818cf8" },
  { key: "AdminReports", icon: "bar-chart-outline", title: "Reportes", desc: "Estadísticas", color: "#22d3ee" },
];

const StatCard = ({ icon, value, label, color, delay }) => {
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], flex: 1 }}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.warmDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statCard}
      >
        <View style={[styles.statIconWrap, { backgroundColor: color + "18" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.statNumber}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { users, getUsers } = useAdminUsers();
  const { restaurants, getRestaurants } = useAdminRestaurants();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    getUsers();
    getRestaurants();
    try {
      const res = await restaurantService.getOrders().catch(() => ({ data: { orders: [] } }));
      setOrders(res.data?.orders || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const stats = [
    { icon: "people-outline", value: users.length, label: "Usuarios", color: COLORS.info },
    { icon: "storefront-outline", value: restaurants.length, label: "Restaurantes", color: COLORS.goldLight },
    { icon: "receipt-outline", value: orders.length, label: "Pedidos", color: COLORS.success },
    { icon: "cash-outline", value: `Q${totalRevenue.toFixed(0)}`, label: "Ingresos", color: COLORS.warning },
  ];

  return (
    <ScrollView
      style={styles.container}
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
            <Ionicons name="shield-checkmark-outline" size={28} color={COLORS.gold} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Panel de Control</Text>
            <Text style={styles.headerSub}>Administración del sistema</Text>
          </View>
        </View>
        <View style={styles.headerLine} />
      </LinearGradient>

      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 100} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Ionicons name="grid-outline" size={18} color={COLORS.gold} />
        <Text style={styles.sectionTitle}>Gestión rápida</Text>
      </View>

      <View style={styles.menuGrid}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.menuTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.menuDesc} numberOfLines={1}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.obsidian },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerAccent: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIcon: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: "rgba(201,168,76,0.1)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(201,168,76,0.2)",
  },
  headerTitle: { fontFamily: "serif", fontSize: 24, color: COLORS.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.5 },
  headerLine: { height: 1, backgroundColor: "rgba(201,168,76,0.12)", marginTop: 16 },

  statsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    paddingHorizontal: 16, marginTop: 16,
  },
  statCard: {
    flex: 1, minWidth: "46%", padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 0,
    ...SHADOWS.sm,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  statNumber: {
    fontFamily: "serif", fontSize: 26, fontWeight: "700", color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11, color: COLORS.textMuted, marginTop: 2,
    textTransform: "uppercase", letterSpacing: 1.2, fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15, color: COLORS.gold, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 1.2,
  },

  menuGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
    paddingHorizontal: 16, paddingBottom: 32,
  },
  menuCard: {
    width: "47%", backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  menuTitle: { fontSize: 14, color: COLORS.text, fontWeight: "700", marginBottom: 2 },
  menuDesc: { fontSize: 11, color: COLORS.textMuted },
});

export default DashboardScreen;

export default DashboardScreen;
