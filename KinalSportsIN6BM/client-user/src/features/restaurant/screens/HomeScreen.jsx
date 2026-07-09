import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { useAuthStore } from "../../../shared/store/authStore";
import * as restaurantService from "../../../shared/api/restaurantService";

const HomeScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, eventsRes] = await Promise.all([
        restaurantService.getMyOrders().catch(() => ({ data: { orders: [] } })),
        restaurantService.getEvents().catch(() => ({ data: { events: [] } })),
      ]);
      const orders = ordersRes.data?.orders || [];
      const events = eventsRes.data?.events || [];
      setStats({
        orderCount: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "preparing").length,
        nextEvent: events.filter((e) => e.status === "active").slice(0, 1)[0] || null,
      });
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const quickActions = [
    { label: "Restaurantes", icon: "🍽️", onPress: () => navigation.navigate("Restaurants", { screen: "RestaurantsList" }) },
    { label: "Mis Pedidos", icon: "📋", count: stats?.pendingOrders, onPress: () => navigation.navigate("Orders", { screen: "MyOrders" }) },
    { label: "Reservaciones", icon: "📅", onPress: () => navigation.navigate("Reservations", { screen: "MyReservations" }) },
    { label: "Eventos", icon: "🎉", onPress: () => navigation.navigate("Restaurants", { screen: "EventsMain" }) },
  ];

  return (
    <ScreenWrapper scroll refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Bienvenido{user?.name ? `, ${user.name}` : ""}</Text>
        <Text style={styles.subtitle}>Disfruta de la mejor experiencia gastronómica</Text>
      </View>

      <View style={styles.grid}>
        {quickActions.map((action, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
            {action.count != null && action.count > 0 && (
              <Text style={styles.badge}>{action.count}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {stats?.nextEvent && (
        <Card style={styles.eventCard}>
          <Text style={styles.eventTitle}>🎉 Próximo Evento</Text>
          <Text style={styles.eventName}>{stats.nextEvent.name}</Text>
          <Text style={styles.eventDesc}>{stats.nextEvent.description}</Text>
        </Card>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  hero: { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, marginBottom: 20 },
  greeting: { fontFamily: "serif", fontSize: 28, color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  actionCard: {
    width: "47%", backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1,
    borderColor: COLORS.borderLight, padding: 16, minHeight: 100, justifyContent: "center", alignItems: "center",
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 14, color: COLORS.text, fontWeight: "600", textAlign: "center" },
  badge: {
    position: "absolute", top: 8, right: 8, backgroundColor: COLORS.gold, color: COLORS.obsidian,
    fontSize: 11, fontWeight: "700", borderRadius: 10, paddingHorizontal: 6, overflow: "hidden",
  },
  eventCard: { marginBottom: 24 },
  eventTitle: { fontSize: 14, color: COLORS.gold, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  eventName: { fontFamily: "serif", fontSize: 20, color: COLORS.text, marginBottom: 4 },
  eventDesc: { fontSize: 13, color: COLORS.textSecondary },
});

export default HomeScreen;