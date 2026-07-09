import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const STATUSES = [
  { key: "active", label: "Activo" },
  { key: "finished", label: "Finalizado" },
  { key: "cancelled", label: "Cancelado" },
];

const AdminEventsScreen = () => {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [status, setStatus] = useState("active");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, rRes] = await Promise.all([
        userClient.get("/event"),
        userClient.get("/restaurant"),
      ]);
      if (eRes.data.success) setItems(eRes.data.events);
      if (rRes.data.success) setRestaurants(rRes.data.restaurants);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setDescription(""); setDate(""); setRestaurantId(""); setStatus("active");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setDescription(item.description || "");
    setDate(item.date ? new Date(item.date).toISOString().slice(0, 16) : "");
    setRestaurantId(item.restaurant?._id || item.restaurant || "");
    setStatus(item.status || "active");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !date) { Alert.alert("Error", "Nombre y fecha obligatorios"); return; }
    if (!restaurantId) { Alert.alert("Error", "Debes seleccionar un restaurante"); return; }
    const body = {
      name: name.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      restaurant: restaurantId,
      status,
    };
    try {
      if (editing) {
        await userClient.put(`/event/${editing._id}`, body);
      } else {
        await userClient.post("/event/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar este evento?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/event/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("es-GT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const restName = (id) => restaurants.find(r => r._id === id)?.name || "—";

  if (loading && !items.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconBox}>
                <MaterialIcons name="event" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.restLabel}>{restName(item.restaurant?._id || item.restaurant)}</Text>
                <Text style={styles.date}>{fmtDate(item.date)}</Text>
                {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
                <View style={[styles.statusBadge, { backgroundColor: item.status === "active" ? COLORS.success + "20" : item.status === "finished" ? COLORS.secondary + "20" : COLORS.error + "20" }]}>
                  <Text style={[styles.statusText, { color: item.status === "active" ? COLORS.success : item.status === "finished" ? COLORS.secondary : COLORS.error }]}>
                    {item.status === "active" ? "Activo" : item.status === "finished" ? "Finalizado" : "Cancelado"}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                  <MaterialIcons name="delete" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Nuevo evento</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay eventos" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} evento</Text>

            <Text style={styles.label}>Restaurante *</Text>
            {restaurants.length === 0 ? (
              <Text style={styles.loadingText}>Cargando restaurantes...</Text>
            ) : (
              <View style={styles.chipRow}>
                {restaurants.map(r => (
                  <TouchableOpacity
                    key={r._id}
                    style={[styles.chip, restaurantId === r._id && styles.chipActive]}
                    onPress={() => setRestaurantId(r._id)}
                  >
                    <Text style={[styles.chipText, restaurantId === r._id && styles.chipTextActive]}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Descripción *</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} value={description} onChangeText={setDescription} multiline />
            <Text style={styles.label}>Fecha y hora *</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-07-15T19:00" />

            <Text style={styles.label}>Estado</Text>
            <View style={styles.chipRow}>
              {STATUSES.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.chip, status === s.key && styles.chipActive]}
                  onPress={() => setStatus(s.key)}
                >
                  <Text style={[styles.chipText, status === s.key && styles.chipTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 10, marginBottom: SPACING.md },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: FONT_SIZE.md },
  card: {},
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  iconBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primary + "15", justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  restLabel: { fontSize: 11, color: COLORS.primary, fontWeight: "600", marginTop: 2 },
  date: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  desc: { fontSize: FONT_SIZE.sm, color: COLORS.text, marginTop: 4 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  actions: { gap: 8 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.md, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  loadingText: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontStyle: "italic" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.text, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
});

export default AdminEventsScreen;
