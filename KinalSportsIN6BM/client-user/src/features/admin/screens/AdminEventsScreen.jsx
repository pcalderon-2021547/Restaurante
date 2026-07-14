import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from "react-native";
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

const AdminEventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [date, setDate] = useState("");
  const [selectedRest, setSelectedRest] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [evRes, restRes] = await Promise.all([
        restaurantService.getEvents().catch(() => ({ data: { events: [] } })),
        restaurantService.getRestaurants().catch(() => ({ data: { restaurants: [] } })),
      ]);
      setEvents(evRes.data?.events || []);
      setRestaurants(restRes.data?.restaurants || []);
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setDesc(""); setDate(""); setSelectedRest(""); setModalVisible(true); };
  const openEdit = (e) => { setEditing(e); setName(e.name); setDesc(e.description); setDate(new Date(e.date).toISOString().split("T")[0]); setSelectedRest(e.restaurant || ""); setModalVisible(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { name, description: desc, date: new Date(date).toISOString(), restaurant: selectedRest };
      if (editing) await restaurantService.updateEvent(editing._id, data);
      else await restaurantService.createEvent(data);
      setModalVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar Evento", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { try { await restaurantService.deleteEvent(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); } }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nuevo Evento" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>{item.description}</Text>
                <Text style={styles.detail}>📅 {new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={item.status} />
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                  <GoldButton title="Eliminar" onPress={() => handleDelete(item._id)} small />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay eventos" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Evento" : "Nuevo Evento"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Descripción" value={desc} onChangeText={setDesc} placeholder="Descripción" />
        <GoldInput label="Fecha (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-12-31" />
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginVertical: 8 }}>RESTAURANTE</Text>
        {restaurants.map((r) => (
          <TouchableOpacity
            key={r._id}
            style={[styles.restOption, selectedRest === r._id && styles.restOptionActive]}
            onPress={() => setSelectedRest(r._id)}
          >
            <Text style={[styles.restOptionText, selectedRest === r._id && { color: COLORS.gold }]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  restOption: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: 6,
  },
  restOptionActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.08)" },
  restOptionText: { fontSize: 14, color: COLORS.text },
});

export default AdminEventsScreen;