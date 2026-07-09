import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const FILTERS = ["todas", "pending", "preparing", "ready", "delivered", "paid", "cancelled"];
const FILTER_LABELS = { todas: "Todas", pending: "Pendientes", preparing: "Preparando", ready: "Listas", delivered: "Entregadas", paid: "Pagadas", cancelled: "Canceladas" };

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

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.filterChip, filter === item && styles.filterActive]} onPress={() => setFilter(item)}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{FILTER_LABELS[item]}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.order}
            onPress={() => navigation.navigate("OrderDetail", { order: item })}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{item._id?.slice(-6)}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.orderType}>🛵 {item.type === "dine_in" ? "Presencial" : item.type === "delivery" ? "Delivery" : "Para llevar"}</Text>
            <Text style={styles.orderTotal}>Q{item.total?.toFixed(2)}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState message="No hay pedidos" />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  filters: { paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8,
  },
  filterActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  filterText: { fontSize: 12, color: COLORS.textMuted },
  filterTextActive: { color: COLORS.gold },
  order: {
    backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderLight,
    padding: 16, marginBottom: 10,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  orderId: { fontFamily: "serif", fontSize: 16, color: COLORS.text },
  orderType: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  orderTotal: { fontSize: 16, color: COLORS.gold, fontWeight: "700" },
  orderDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
});

export default MyOrdersScreen;