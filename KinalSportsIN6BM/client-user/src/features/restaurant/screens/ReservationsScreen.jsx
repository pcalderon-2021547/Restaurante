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

const ReservationsScreen = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRest, setSelectedRest] = useState("");
  const [resDate, setResDate] = useState("");
  const [resTime, setResTime] = useState("");
  const [people, setPeople] = useState("2");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [resRes, restRes] = await Promise.all([
        restaurantService.getMyReservations().catch(() => ({ data: { reservations: [] } })),
        restaurantService.getRestaurants().catch(() => ({ data: { restaurants: [] } })),
      ]);
      setReservations(resRes.data?.reservations || []);
      setRestaurants(restRes.data?.restaurants || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!selectedRest || !resDate) return Alert.alert("Error", "Selecciona restaurante y fecha");
    try {
      setSaving(true);
      const dateTime = new Date(`${resDate}T${resTime || "12:00"}`).toISOString();
      await restaurantService.createReservation({
        restaurant: selectedRest,
        date: dateTime,
        numberOfPeople: parseInt(people, 10),
        notes,
      });
      Alert.alert("Éxito", "Reserva creada");
      setModalVisible(false);
      setSelectedRest("");
      setResDate("");
      setResTime("");
      setPeople("2");
      setNotes("");
      load();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al crear reserva");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (id) => {
    Alert.alert("Cancelar Reserva", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí", style: "destructive",
        onPress: async () => {
          try {
            await restaurantService.cancelReservation(id);
            load();
          } catch { Alert.alert("Error", "No se pudo cancelar"); }
        },
      },
    ]);
  };

  const getRestName = (id) => {
    const r = restaurants.find((r) => r._id === id);
    return r?.name || "Restaurante";
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton
        title="Nueva Reserva"
        onPress={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      />
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={[styles.itemName, { fontFamily: "serif" }]}>{getRestName(item.restaurant)}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.value}>📅 {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
            <Text style={styles.value}>👤 {item.customerName} - 📞 {item.customerPhone}</Text>
            <Text style={styles.value}>👥 {item.numberOfPeople} personas</Text>
            {item.notes ? <Text style={styles.value}>📝 {item.notes}</Text> : null}
            {item.status === "pending" && (
              <GoldButton title="Cancelar" onPress={() => handleCancel(item._id)} small style={{ marginTop: 8 }} />
            )}
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No tienes reservaciones" />}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Nueva Reserva" onConfirm={handleCreate} confirmText="Crear" confirmLoading={saving}>
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 8 }}>RESTAURANTE</Text>
        {restaurants.map((r) => (
          <TouchableOpacity
            key={r._id}
            style={[styles.restOption, selectedRest === r._id && styles.restOptionActive]}
            onPress={() => setSelectedRest(r._id)}
          >
            <Text style={[styles.restOptionText, selectedRest === r._id && { color: COLORS.gold }]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
        <GoldInput label="Fecha (YYYY-MM-DD)" value={resDate} onChangeText={setResDate} placeholder="2026-12-31" />
        <GoldInput label="Hora (HH:MM)" value={resTime} onChangeText={setResTime} placeholder="19:00" />
        <GoldInput label="Personas" value={people} onChangeText={setPeople} placeholder="2" keyboardType="numeric" />
        <GoldInput label="Notas" value={notes} onChangeText={setNotes} placeholder="Alergias, preferencias..." />
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  itemName: { fontSize: 17, color: COLORS.text, fontWeight: "600", flex: 1 },
  value: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  restOption: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: 6,
  },
  restOptionActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.08)" },
  restOptionText: { fontSize: 14, color: COLORS.text },
});

export default ReservationsScreen;