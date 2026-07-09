import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const STATUS_MAP = {
  pending: { label: "Pendiente", color: "#f59e0b", bg: "#f59e0b20" },
  confirmed: { label: "Confirmada", color: "#22c55e", bg: "#22c55e20" },
  cancelled: { label: "Cancelada", color: "#ef4444", bg: "#ef444420" },
  completed: { label: "Completada", color: "#64748b", bg: "#64748b20" },
};

const AdminAllReservationsScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userClient.get("/reservation");
      if (data.success) setReservations(data.reservations);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleStatus = (id, newStatus) => {
    Alert.alert("Cambiar estado", `¿Marcar como ${newStatus}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "OK", onPress: async () => {
        try {
          await userClient.put(`/reservation/update/${id}`, { status: newStatus });
          fetch();
        } catch (err) {
          Alert.alert("Error", err.response?.data?.message || "Error");
        }
      }},
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar esta reservación?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/reservation/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading && !reservations.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const st = STATUS_MAP[item.status] || STATUS_MAP.pending;
          return (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.customer}>{item.customerName || `Usuario #${item.user}`}</Text>
                <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <Text style={styles.restaurant}>{item.restaurant?.name || "—"}</Text>
              <View style={styles.detailRow}>
                <MaterialIcons name="event" size={14} color={COLORS.secondary} />
                <Text style={styles.detail}>{fmtDate(item.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="people" size={14} color={COLORS.secondary} />
                <Text style={styles.detail}>{item.numberOfPeople} pers.</Text>
              </View>
              {item.table && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="table-restaurant" size={14} color={COLORS.secondary} />
                  <Text style={styles.detail}>Mesa {item.table?.number || item.table}</Text>
                </View>
              )}
              {item.phone && <Text style={styles.phone}>Tel: {item.phone}</Text>}

              <View style={styles.actionsRow}>
                {item.status !== "confirmed" && (
                  <TouchableOpacity style={styles.actionChip} onPress={() => handleStatus(item._id, "confirmed")}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                    <Text style={[styles.actionText, { color: COLORS.success }]}>Confirmar</Text>
                  </TouchableOpacity>
                )}
                {item.status !== "cancelled" && (
                  <TouchableOpacity style={styles.actionChip} onPress={() => handleStatus(item._id, "cancelled")}>
                    <MaterialIcons name="cancel" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Cancelar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionChip} onPress={() => handleDelete(item._id)}>
                  <MaterialIcons name="delete" size={16} color={COLORS.secondary} />
                  <Text style={[styles.actionText, { color: COLORS.secondary }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No hay reservaciones" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md },
  card: {},
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  customer: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  restaurant: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: "600", marginBottom: 4 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  detail: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  phone: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 4 },
  actionsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.background },
  actionText: { fontSize: 12, fontWeight: "600" },
});

export default AdminAllReservationsScreen;
