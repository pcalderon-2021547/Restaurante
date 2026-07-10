import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import * as restaurantService from "../../../shared/api/restaurantService";

const STATUS_PALETTE = {
  pending: { icon: "time-outline", label: "Pendiente", color: COLORS.gold, bg: "rgba(201,168,76,0.08)" },
  preparing: { icon: "flame-outline", label: "Preparando", color: COLORS.warning, bg: "rgba(224,168,90,0.08)" },
  ready: { icon: "checkmark-circle-outline", label: "Listo", color: COLORS.info, bg: "rgba(126,184,247,0.08)" },
  delivered: { icon: "bicycle-outline", label: "Entregado", color: COLORS.success, bg: "rgba(52,211,153,0.08)" },
  paid: { icon: "wallet-outline", label: "Pagado", color: COLORS.success, bg: "rgba(52,211,153,0.08)" },
  cancelled: { icon: "close-circle-outline", label: "Cancelado", color: COLORS.error, bg: "rgba(224,90,90,0.08)" },
};

const FILTERS = ["todas", "pending", "preparing", "ready", "delivered", "paid", "cancelled"];
const FILTER_LABELS = { todas: "Todas", pending: "Pendientes", preparing: "Preparando", ready: "Listas", delivered: "Entregadas", paid: "Pagadas", cancelled: "Canceladas" };
const FILTER_ICONS = { todas: "apps-outline", pending: "time-outline", preparing: "flame-outline", ready: "checkmark-circle-outline", delivered: "bicycle-outline", paid: "wallet-outline", cancelled: "close-circle-outline" };

const TYPE_LABELS = { dine_in: { label: "Presencial", icon: "storefront-outline" }, delivery: { label: "Delivery", icon: "bicycle-outline" }, takeaway: { label: "Para llevar", icon: "bag-handle-outline" } };

const OrderCard = ({ order, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const statusInfo = STATUS_PALETTE[order.status] || STATUS_PALETTE.pending;
  const typeInfo = TYPE_LABELS[order.type] || { label: order.type, icon: "ellipse-outline" };

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={styles.order}>
          <View style={[styles.orderAccent, { backgroundColor: statusInfo.color }]} />
          <View style={styles.orderBody}>
            <View style={styles.orderTop}>
              <View style={styles.orderIdRow}>
                <View style={[styles.typeIcon, { backgroundColor: statusInfo.bg }]}>
                  <Ionicons name={typeInfo.icon} size={16} color={statusInfo.color} />
                </View>
                <View>
                  <Text style={styles.orderId}>#{order._id?.slice(-6)}</Text>
                  <Text style={styles.orderType}>{typeInfo.label}</Text>
                </View>
              </View>
              <StatusBadge status={order.status} />
            </View>
            <View style={styles.orderBottom}>
              <View style={styles.orderDateRow}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
              <Text style={styles.orderTotal}>Q{order.total?.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SkeletonCard = () => (
  <View style={[styles.order, { overflow: "hidden" }]}>
    <View style={styles.orderAccent} />
    <View style={styles.orderBody}>
      <View style={styles.orderTop}>
        <View style={styles.orderIdRow}>
          <View style={[styles.typeIcon, { backgroundColor: "rgba(201,168,76,0.05)" }]} />
          <View style={{ gap: 4 }}>
            <View style={{ width: 70, height: 12, backgroundColor: "rgba(201,168,76,0.08)", borderRadius: 4 }} />
            <View style={{ width: 50, height: 10, backgroundColor: "rgba(201,168,76,0.05)", borderRadius: 4 }} />
          </View>
        </View>
        <View style={{ width: 60, height: 22, backgroundColor: "rgba(201,168,76,0.08)", borderRadius: 999 }} />
      </View>
      <View style={styles.orderBottom}>
        <View style={{ width: 90, height: 10, backgroundColor: "rgba(201,168,76,0.05)", borderRadius: 4 }} />
        <View style={{ width: 60, height: 14, backgroundColor: "rgba(201,168,76,0.08)", borderRadius: 4 }} />
      </View>
    </View>
  </View>
);

const MyOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getMyOrders();
      setOrders(res.data?.orders || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "todas" ? orders : orders.filter((o) => o.status === filter);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <Text style={styles.subtitle}>{orders.length} pedido{orders.length !== 1 ? "s" : ""}</Text>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.filterActive]}
            onPress={() => setFilter(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={FILTER_ICONS[item]}
              size={13}
              color={filter === item ? COLORS.gold : COLORS.textMuted}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {FILTER_LABELS[item]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={{ paddingTop: 4 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => navigation.navigate("OrderDetail", { order: item })} />
          )}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={filter === "todas" ? "bag-handle-outline" : FILTER_ICONS[filter]}
                  size={40}
                  color={COLORS.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === "todas" ? "No hay pedidos" : `No hay pedidos ${FILTER_LABELS[filter]?.toLowerCase()}`}
              </Text>
              <Text style={styles.emptySub}>Los pedidos que hagas aparecerán aquí</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 4 },
  title: { fontFamily: "serif", fontSize: 26, color: COLORS.text, letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  filters: { paddingVertical: 14, gap: 8 },
  filterChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8,
  },
  filterActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  filterText: { fontSize: 12, color: COLORS.textMuted },
  filterTextActive: { color: COLORS.gold },

  order: {
    flexDirection: "row", borderRadius: 12, overflow: "hidden",
    marginBottom: 10, ...SHADOWS.sm,
  },
  orderAccent: { width: 4 },
  orderBody: {
    flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderLeftWidth: 0,
    borderColor: COLORS.borderLight, padding: 14, borderTopRightRadius: 12, borderBottomRightRadius: 12,
  },
  orderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderIdRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  orderId: { fontFamily: "serif", fontSize: 15, color: COLORS.text, fontWeight: "600" },
  orderType: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  orderBottom: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  orderDateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  orderDate: { fontSize: 11, color: COLORS.textMuted },
  orderTotal: { fontSize: 16, color: COLORS.gold, fontWeight: "700" },

  empty: { alignItems: "center", paddingTop: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(201,168,76,0.06)", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, color: COLORS.text, fontWeight: "600", marginBottom: 4 },
  emptySub: { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },
});

export default MyOrdersScreen;