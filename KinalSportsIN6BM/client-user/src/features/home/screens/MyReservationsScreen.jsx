import React, { useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import { useReservations } from "../hooks/useReservations";
import { MaterialIcons } from "@expo/vector-icons";

const STATUS_MAP = {
  pending: { label: "Pendiente", color: "#f59e0b", bg: "#f59e0b20" },
  confirmed: { label: "Confirmada", color: "#22c55e", bg: "#22c55e20" },
  cancelled: { label: "Cancelada", color: "#ef4444", bg: "#ef444420" },
  completed: { label: "Completada", color: "#64748b", bg: "#64748b20" },
};

const ReservationItem = ({ item, onCancel }) => {
  const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
  const dateObj = new Date(item.date);
  const dateStr = dateObj.toLocaleDateString("es-GT", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.restaurantName}>
          {item.restaurant?.name || "Restaurante"}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <MaterialIcons name="event" size={16} color={COLORS.secondary} />
        <Text style={styles.detailText}>{dateStr}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons name="schedule" size={16} color={COLORS.secondary} />
        <Text style={styles.detailText}>{timeStr}</Text>
      </View>
      <View style={styles.detailRow}>
        <MaterialIcons name="people" size={16} color={COLORS.secondary} />
        <Text style={styles.detailText}>{item.numberOfPeople} personas</Text>
      </View>
      {item.table && (
        <View style={styles.detailRow}>
          <MaterialIcons name="table-restaurant" size={16} color={COLORS.secondary} />
          <Text style={styles.detailText}>Mesa {item.table?.number || item.table}</Text>
        </View>
      )}
      {item.notes && (
        <Text style={styles.notes}>{item.notes}</Text>
      )}

      {(item.status === "pending" || item.status === "confirmed") && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item._id)}>
          <MaterialIcons name="cancel" size={16} color={COLORS.error} />
          <Text style={styles.cancelText}>Cancelar reservación</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const MyReservationsScreen = () => {
  const { reservations, loading, error, getMyReservations, cancelReservation } = useReservations();

  useEffect(() => {
    getMyReservations();
  }, [getMyReservations]);

  const onRefresh = useCallback(() => {
    getMyReservations();
  }, [getMyReservations]);

  const handleCancel = (id) => {
    Alert.alert(
      "Cancelar reservación",
      "¿Estás seguro de cancelar esta reservación?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            const ok = await cancelReservation(id);
            if (ok) Alert.alert("Cancelada", "La reservación ha sido cancelada.");
            else Alert.alert("Error", "No se pudo cancelar la reservación.");
          },
        },
      ]
    );
  };

  if (loading && !reservations.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ReservationItem item={item} onCancel={handleCancel} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="No tienes reservaciones" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  error: { color: COLORS.error, padding: SPACING.md, textAlign: "center" },
  reservationCard: {},
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm },
  restaurantName: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: "700" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: 6 },
  detailText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  notes: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontStyle: "italic", marginTop: SPACING.sm, backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: 6 },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginTop: SPACING.md, justifyContent: "center", padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.error + "40", borderRadius: 8 },
  cancelText: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.error },
});

export default MyReservationsScreen;
