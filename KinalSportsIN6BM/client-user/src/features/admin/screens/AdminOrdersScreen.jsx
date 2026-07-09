import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const STATUS_OPTIONS = ["pending", "preparing", "ready", "delivered", "paid", "cancelled"];
const FILTERS = ["todas", ...STATUS_OPTIONS];
const FILTER_LABELS = { todas: "Todas", pending: "Pendientes", preparing: "Preparando", ready: "Listas", delivered: "Entregadas", paid: "Pagadas", cancelled: "Canceladas" };

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getOrders(); setOrders(res.data?.orders || []); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = filter === "todas" ? orders : orders.filter((o) => o.status === filter);

  const openStatus = (order) => { setSelectedOrder(order); setNewStatus(order.status); setStatusModal(true); };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selectedOrder.status) return;
    try {
      setSaving(true);
      await restaurantService.updateOrder(selectedOrder._id, { status: newStatus });
      setStatusModal(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <FlatList
        horizontal data={FILTERS} keyExtractor={(f) => f} showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: filter === item ? COLORS.gold : COLORS.border, backgroundColor: filter === item ? "rgba(201,168,76,0.1)" : "transparent", marginRight: 8 }}
            onPress={() => setFilter(item)}
          >
            <Text style={{ fontSize: 12, color: filter === item ? COLORS.gold : COLORS.textMuted }}>{FILTER_LABELS[item]}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.id}>#{item._id?.slice(-6)}</Text>
                <Text style={styles.detail}>Tipo: {item.type}</Text>
                <Text style={styles.detail}>Total: Q{item.total?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={item.status} />
                <GoldButton title="Cambiar Estado" onPress={() => openStatus(item)} small />
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay pedidos" />}
      />
      <Modal visible={statusModal} onClose={() => setStatusModal(false)} title="Cambiar Estado" onConfirm={handleUpdateStatus} confirmText="Actualizar" confirmLoading={saving}>
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 12 }}>Pedido: #{selectedOrder?._id?.slice(-6)}</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s} onPress={() => setNewStatus(s)}
              style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: newStatus === s ? COLORS.gold : COLORS.border, backgroundColor: newStatus === s ? "rgba(201,168,76,0.1)" : "transparent" }}
            >
              <Text style={{ fontSize: 12, color: newStatus === s ? COLORS.gold : COLORS.textMuted }}>{FILTER_LABELS[s]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  id: { fontFamily: "serif", fontSize: 16, color: COLORS.text },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminOrdersScreen;