import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const LOCATIONS = ["Interior", "Terraza", "Balcón", "Jardín", "Barra", "VIP", "Salón privado"];

const AdminTablesScreen = () => {
  const [tables, setTables] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [restaurantId, setRestaurantId] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        userClient.get("/table"),
        userClient.get("/restaurant"),
      ]);
      if (tRes.data.success) setTables(tRes.data.tables);
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
    setNumber(""); setCapacity(""); setLocation(""); setRestaurantId("");
    setModalVisible(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setNumber(String(t.number));
    setCapacity(String(t.capacity));
    setLocation(t.location || "");
    setRestaurantId(t.restaurant?._id || t.restaurant || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!number || !capacity) {
      Alert.alert("Error", "Número y capacidad obligatorios"); return;
    }
    if (!restaurantId) {
      Alert.alert("Error", "Debes seleccionar un restaurante"); return;
    }
    const body = {
      number: parseInt(number),
      capacity: parseInt(capacity),
      location,
      restaurant: restaurantId,
    };
    try {
      if (editing) {
        await userClient.put(`/table/update/${editing._id}`, body);
      } else {
        await userClient.post("/table/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar esta mesa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/table/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const statusColor = (s) => {
    if (s === "available") return COLORS.success;
    if (s === "occupied") return COLORS.warning;
    if (s === "reserved") return "#f59e0b";
    return COLORS.secondary;
  };

  const restName = (id) => restaurants.find(r => r._id === id)?.name || "—";

  if (loading && !tables.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tables}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.badge, { backgroundColor: statusColor(item.status) + "20" }]}>
                <MaterialIcons name="table-restaurant" size={24} color={statusColor(item.status)} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Mesa {item.number}</Text>
                <Text style={styles.cardSub}>{restName(item.restaurant?._id || item.restaurant)}</Text>
                <Text style={styles.cardSub}>Capacidad: {item.capacity} pers. · {item.location}</Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>
                  {item.status === "available" ? "Disponible"
                    : item.status === "occupied" ? "Ocupada"
                    : item.status === "reserved" ? "Reservada"
                    : item.status}
                </Text>
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
            <Text style={styles.addBtnText}>Nueva mesa</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay mesas" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar mesa" : "Nueva mesa"}</Text>
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
                    <Text style={[styles.chipText, restaurantId === r._id && styles.chipTextActive]}>
                      {r.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.label}>Número *</Text>
            <TextInput style={styles.input} value={number} onChangeText={setNumber} keyboardType="number-pad" />
            <Text style={styles.label}>Capacidad *</Text>
            <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />
            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.chipRow}>
              {LOCATIONS.map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.chip, location === loc && styles.chipActive]}
                  onPress={() => setLocation(location === loc ? "" : loc)}
                >
                  <Text style={[styles.chipText, location === loc && styles.chipTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {location && location !== "" && !LOCATIONS.includes(location) && (
              <TextInput style={[styles.input, { marginTop: 4 }]} value={location} onChangeText={setLocation} placeholder="O escribe una personalizada" />
            )}
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
  cardRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  badge: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  cardSub: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  status: { fontSize: FONT_SIZE.xs, fontWeight: "600", marginTop: 4 },
  actions: { gap: 8 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, maxHeight: "90%" },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  loadingText: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontStyle: "italic" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.text, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
});

export default AdminTablesScreen;
