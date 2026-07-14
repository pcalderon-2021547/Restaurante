import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { useAuthStore } from "../../../shared/store/authStore";
import * as restaurantService from "../../../shared/api/restaurantService";

const QUICK_ACTIONS = [
  { label: "Restaurantes", icon: "storefront-outline", color: COLORS.gold, screen: "Restaurants", params: { screen: "RestaurantsList" } },
  { label: "Mis Pedidos", icon: "receipt-outline", color: COLORS.info, screen: "Orders", params: { screen: "MyOrders" } },
  { label: "Reservaciones", icon: "calendar-outline", color: COLORS.success, screen: "Reservations", params: { screen: "MyReservations" } },
  { label: "Eventos", icon: "sparkles-outline", color: COLORS.warning, screen: "Restaurants", params: { screen: "EventsMain" } },
];

const ActionCard = ({ item, count, index, onPress }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay: 150 + index * 80,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }], width: "48%" }}>
      <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.actionIconWrap, { backgroundColor: item.color + "15" }]}>
          <Ionicons name={item.icon} size={26} color={item.color} />
        </View>
        <Text style={styles.actionLabel}>{item.label}</Text>
        {count != null && count > 0 && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{count > 9 ? "9+" : count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const MiniStat = ({ icon, value, label, color, delay }) => {
  const [anim] = useState(new Animated.Value(0));

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }], flex: 1 }}>
      <View style={styles.miniStat}>
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
        <Text style={styles.miniStatLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
};

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
      const pending = orders.filter((o) => o.status === "pending" || o.status === "preparing");
      setStats({
        orderCount: orders.length,
        pendingOrders: pending.length,
        totalSpent: orders.reduce((s, o) => s + (o.total || 0), 0),
        nextEvent: events.filter((e) => e.status === "active").slice(0, 1)[0] || null,
      });
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper scroll refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.gold} />}>
      <LinearGradient
        colors={[COLORS.charcoal, COLORS.obsidian]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={24} color={COLORS.gold} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.greeting}>¡Bienvenido{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!</Text>
            <Text style={styles.subtitle}>Disfruta de la mejor experiencia gastronómica</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map((item, i) => (
          <ActionCard
            key={item.label}
            item={item}
            count={item.label === "Mis Pedidos" ? stats?.pendingOrders : undefined}
            index={i}
            onPress={() => navigation.navigate(item.screen, item.params)}
          />
        ))}
      </View>

      <View style={styles.statsRow}>
        <MiniStat icon="receipt-outline" value={stats?.orderCount || 0} label="Pedidos" color={COLORS.gold} delay={100} />
        <MiniStat icon="flame-outline" value={stats?.pendingOrders || 0} label="Activos" color={COLORS.warning} delay={200} />
        <MiniStat icon="cash-outline" value={`Q${(stats?.totalSpent || 0).toFixed(0)}`} label="Gastado" color={COLORS.success} delay={300} />
      </View>

      {stats?.nextEvent ? (
        <LinearGradient
          colors={["rgba(201,168,76,0.06)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventCard}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventIcon}>
              <Ionicons name="sparkles-outline" size={18} color={COLORS.gold} />
            </View>
            <Text style={styles.eventTitle}>Próximo Evento</Text>
          </View>
          <Text style={styles.eventName}>{stats.nextEvent.name}</Text>
          <Text style={styles.eventDesc} numberOfLines={2}>{stats.nextEvent.description}</Text>
          <View style={styles.eventMeta}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.eventDate}>{new Date(stats.nextEvent.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.emptyEvent}>
          <View style={[styles.eventIcon, { backgroundColor: "rgba(201,168,76,0.05)" }]}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyEventTitle}>No hay eventos próximos</Text>
          <Text style={styles.emptyEventSub}>Los eventos activos aparecerán aquí</Text>
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  hero: { marginHorizontal: -16, paddingHorizontal: 20, paddingVertical: 24, marginTop: -16 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: "rgba(201,168,76,0.1)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(201,168,76,0.25)",
  },
  heroText: { flex: 1 },
  greeting: { fontFamily: "serif", fontSize: 24, color: COLORS.text, letterSpacing: 0.3 },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },

  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
  actionCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1,
    borderColor: COLORS.borderLight, padding: 18, minHeight: 110,
    alignItems: "center", justifyContent: "center", position: "relative",
    ...SHADOWS.sm,
  },
  actionIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  actionLabel: { fontSize: 14, color: COLORS.text, fontWeight: "600", textAlign: "center" },
  actionBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: COLORS.gold, borderRadius: 12, minWidth: 22, height: 22,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 5,
  },
  actionBadgeText: { fontSize: 11, fontWeight: "800", color: COLORS.obsidian },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 4 },
  miniStat: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.borderLight,
    padding: 12, alignItems: "center", gap: 4,
  },
  miniStatValue: { fontSize: 18, fontFamily: "serif", fontWeight: "700" },
  miniStatLabel: { fontSize: 9, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: "600" },

  eventCard: {
    marginTop: 20, marginBottom: 24, borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
    backgroundColor: COLORS.surface,
  },
  eventHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  eventIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(201,168,76,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  eventTitle: { fontSize: 12, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  eventName: { fontFamily: "serif", fontSize: 18, color: COLORS.text, marginBottom: 4 },
  eventDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 18 },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventDate: { fontSize: 12, color: COLORS.textMuted },

  emptyEvent: { alignItems: "center", paddingVertical: 28, marginTop: 8 },
  emptyEventTitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 10, fontWeight: "500" },
  emptyEventSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
});

export default HomeScreen;