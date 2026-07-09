import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import GoldInput from "../../../shared/components/ui/GoldInput";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const STATUS_OPTIONS = ["pending_acceptance", "accepted", "preparing", "ready_for_delivery", "in_transit", "delivered", "cancelled", "failed_delivery"];
const STATUS_LABELS = {
  pending_acceptance: "Pendiente", accepted: "Aceptado", preparing: "Preparando",
  ready_for_delivery: "Listo", in_transit: "En camino", delivered: "Entregado",
  cancelled: "Cancelado", failed_delivery: "Fallido",
};
const FILTERS = ["todas", ...STATUS_OPTIONS];
const FILTER_LABELS = { todas: "Todas", ...STATUS_LABELS };

const AdminDeliveriesScreen = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const [statusModal, setStatusModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [assignPersonId, setAssignPersonId] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [delRes, usersRes] = await Promise.all([
        restaurantService.getDeliveries().catch(() => ({ data: [] })),
        restaurantService.getOrders ? restaurantService.getOrders().catch(() => ({ data: { orders: [] } })) : Promise.resolve({ data: { orders: [] } }),
      ]);
      const list = Array.isArray(delRes.data) ? delRes.data : delRes.data?.deliveries || [];
      setDeliveries(list);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "todas" ? deliveries : deliveries.filter((d) => d.status === filter);

  const openStatus = (delivery) => { setSelectedDelivery(delivery); setNewStatus(delivery.status); setStatusModal(true); };

  const openAssign = (delivery) => { setSelectedDelivery(delivery); setAssignPersonId(delivery.deliveryPerson || ""); setAssignModal(true); };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selectedDelivery.status) return;
    try {
      setSaving(true);
      await restaurantService.updateDeliveryStatus(selectedDelivery._id, newStatus);
      setStatusModal(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignPersonId) return;
    try {
      setSaving(true);
      await restaurantService.assignDeliveryPerson(selectedDelivery._id, assignPersonId);
      setAssignModal(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleCancelDelivery = (id) => {
    Alert.alert("Cancelar Delivery", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      { text: "Sí", style: "destructive", onPress: async () => { try { await restaurantService.cancelDelivery(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al cancelar"); } }},
    ]);
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
                <Text style={styles.id}>#{item.order?.slice(-6) || item._id?.slice(-6)}</Text>
                <Text style={styles.detail}>Repartidor: {item.deliveryPerson || "Sin asignar"}</Text>
                <Text style={styles.detail}>Pago: {item.paymentMethod || "N/A"} - {item.paymentStatus || "N/A"}</Text>
                {item.deliveryFee != null && <Text style={styles.detail}>Tarifa: Q{item.deliveryFee.toFixed(2)}</Text>}
                {item.estimatedDeliveryTime && <Text style={styles.detail}>Tiempo: ~{item.estimatedDeliveryTime} min</Text>}
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <StatusBadge status={item.status} />
                <GoldButton title="Estado" onPress={() => openStatus(item)} small />
                <GoldButton title="Asignar" onPress={() => openAssign(item)} small />
                {item.status !== "cancelled" && item.status !== "delivered" && (
                  <GoldButton title="Cancelar" onPress={() => handleCancelDelivery(item._id)} small />
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay entregas" />}
      />
      <Modal visible={statusModal} onClose={() => setStatusModal(false)} title="Cambiar Estado" onConfirm={handleUpdateStatus} confirmText="Actualizar" confirmLoading={saving}>
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 12 }}>Delivery: #{selectedDelivery?._id?.slice(-6)}</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s} onPress={() => setNewStatus(s)}
              style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: newStatus === s ? COLORS.gold : COLORS.border, backgroundColor: newStatus === s ? "rgba(201,168,76,0.1)" : "transparent" }}
            >
              <Text style={{ fontSize: 12, color: newStatus === s ? COLORS.gold : COLORS.textMuted }}>{STATUS_LABELS[s]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
      <Modal visible={assignModal} onClose={() => setAssignModal(false)} title="Asignar Repartidor" onConfirm={handleAssign} confirmText="Asignar" confirmLoading={saving}>
        <GoldInput label="ID del repartidor" value={assignPersonId} onChangeText={setAssignPersonId} placeholder="Ingresa el ID del usuario" />
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  id: { fontFamily: "serif", fontSize: 16, color: COLORS.text },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminDeliveriesScreen;
