import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, TextInput } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import { DateInput, TimeInput } from "../../../shared/components/DateTimePicker";
import { useReservations } from "../hooks/useReservations";
import Button from "../../../shared/components/Button";
import { MaterialIcons } from "@expo/vector-icons";

const STATUS_MAP = {
  pending: { label: "Pendiente", color: "#f59e0b", bg: "#f59e0b20" },
  confirmed: { label: "Confirmada", color: "#22c55e", bg: "#22c55e20" },
  cancelled: { label: "Cancelada", color: "#ef4444", bg: "#ef444420" },
  completed: { label: "Completada", color: "#64748b", bg: "#64748b20" },
};

const ReservationItem = ({ item, onCancel, onEdit }) => {
  const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
  const dateObj = new Date(item.date);
  const dateStr = dateObj.toLocaleDateString("es-GT", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

  return (
    <Card style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.restaurantName}>{item.restaurant?.name || "Restaurante"}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <View style={styles.detailRow}><MaterialIcons name="event" size={16} color={COLORS.secondary} /><Text style={styles.detailText}>{dateStr}</Text></View>
      <View style={styles.detailRow}><MaterialIcons name="schedule" size={16} color={COLORS.secondary} /><Text style={styles.detailText}>{timeStr}</Text></View>
      <View style={styles.detailRow}><MaterialIcons name="people" size={16} color={COLORS.secondary} /><Text style={styles.detailText}>{item.numberOfPeople} personas</Text></View>
      {item.table && (
        <View style={styles.detailRow}><MaterialIcons name="table-restaurant" size={16} color={COLORS.secondary} /><Text style={styles.detailText}>Mesa {item.table?.number || item.table}</Text></View>
      )}
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      <View style={styles.actionRow}>
        {(item.status === "pending" || item.status === "confirmed") && (
          <>
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
              <MaterialIcons name="edit" size={16} color={COLORS.primary} />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item._id)}>
              <MaterialIcons name="cancel" size={16} color={COLORS.error} />
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );
};

const MyReservationsScreen = () => {
  const { reservations, loading, getMyReservations, cancelReservation, updateReservation } = useReservations();
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPeople, setEditPeople] = useState("");

  useEffect(() => { getMyReservations(); }, [getMyReservations]);

  const onRefresh = useCallback(() => { getMyReservations(); }, [getMyReservations]);

  const handleCancel = (id) => {
    Alert.alert("Cancelar reservación", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      { text: "Sí, cancelar", style: "destructive", onPress: async () => {
        const ok = await cancelReservation(id);
        if (ok) Alert.alert("Cancelada", "La reservación ha sido cancelada.");
        else Alert.alert("Error", "No se pudo cancelar la reservación.");
      }},
    ]);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const d = new Date(item.date);
    setEditDate(d.toISOString().slice(0, 10));
    setEditTime(d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: false }));
    setEditPeople(String(item.numberOfPeople));
    setEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editDate || !editTime) { Alert.alert("Error", "Completa la fecha y hora"); return; }
    if (!editPeople || parseInt(editPeople) < 1) { Alert.alert("Error", "Indica el número de personas"); return; }
    try {
      await updateReservation(editingItem._id, {
        date: new Date(`${editDate}T${editTime}:00.000Z`).toISOString(),
        numberOfPeople: parseInt(editPeople),
      });
      setEditModal(false);
      getMyReservations();
      Alert.alert("Actualizada", "Reservación modificada correctamente");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading && !reservations.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ReservationItem item={item} onCancel={handleCancel} onEdit={openEdit} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="No tienes reservaciones" />}
      />

      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Editar reservación</Text>
            <Text style={styles.editRestName}>{editingItem?.restaurant?.name}</Text>
            <Text style={styles.label}>Fecha</Text>
            <DateInput value={editDate} onChange={setEditDate} />
            <Text style={styles.label}>Hora</Text>
            <TimeInput value={editTime} onChange={setEditTime} />
            <Text style={styles.label}>Personas</Text>
            <TextInput style={styles.input} value={editPeople} onChangeText={setEditPeople} keyboardType="number-pad" />
            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setEditModal(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleEditSave} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  reservationCard: {},
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm },
  restaurantName: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: "700" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: 6 },
  detailText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  notes: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontStyle: "italic", marginTop: SPACING.sm, backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: 6 },
  actionRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md, justifyContent: "center" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.primary + "40", borderRadius: 8, flex: 1, justifyContent: "center" },
  editText: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.primary },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.error + "40", borderRadius: 8, flex: 1, justifyContent: "center" },
  cancelText: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.error },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  editRestName: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: "600", marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text, marginBottom: SPACING.sm },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
});

export default MyReservationsScreen;
