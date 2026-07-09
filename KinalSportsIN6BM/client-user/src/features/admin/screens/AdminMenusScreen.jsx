import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const TYPES = [
  { key: "DAILY", label: "Diario" },
  { key: "PROMOTION", label: "Promoción" },
  { key: "EVENT", label: "Evento" },
];

const AdminMenusScreen = () => {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [menuType, setMenuType] = useState("DAILY");
  const [restaurantId, setRestaurantId] = useState("");
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, rRes, dRes] = await Promise.all([
        userClient.get("/menu"),
        userClient.get("/restaurant"),
        userClient.get("/dish"),
      ]);
      if (mRes.data.success) setItems(mRes.data.menus);
      if (rRes.data.success) setRestaurants(rRes.data.restaurants);
      if (dRes.data.success) setDishes(dRes.data.dishes);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setDescription(""); setMenuType("DAILY"); setRestaurantId("");
    setSelectedDishes([]); setValidFrom(""); setValidUntil("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setDescription(item.description || "");
    setMenuType(item.type || "DAILY");
    setRestaurantId(item.restaurant?._id || item.restaurant || "");
    setSelectedDishes((item.dishes || []).map(d => d._id || d));
    setValidFrom(item.validFrom ? new Date(item.validFrom).toISOString().slice(0, 16) : "");
    setValidUntil(item.validUntil ? new Date(item.validUntil).toISOString().slice(0, 16) : "");
    setModalVisible(true);
  };

  const toggleDish = (dishId) => {
    setSelectedDishes(prev =>
      prev.includes(dishId) ? prev.filter(d => d !== dishId) : [...prev, dishId]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Error", "Nombre obligatorio"); return; }
    if (!restaurantId) { Alert.alert("Error", "Debes seleccionar un restaurante"); return; }
    const body = {
      name: name.trim(),
      description: description.trim(),
      type: menuType,
      restaurant: restaurantId,
    };
    if (selectedDishes.length > 0) body.dishes = selectedDishes;
    if (validFrom) body.validFrom = new Date(validFrom).toISOString();
    if (validUntil) body.validUntil = new Date(validUntil).toISOString();
    try {
      if (editing) {
        await userClient.put(`/menu/update/${editing._id}`, body);
      } else {
        await userClient.post("/menu/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar este menú?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/menu/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const typeLabel = (t) => ({ DAILY: "Diario", PROMOTION: "Promoción", EVENT: "Evento" }[t] || t);
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
                <MaterialIcons name="menu-book" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.restLabel}>{restName(item.restaurant?._id || item.restaurant)}</Text>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <View style={styles.meta}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{typeLabel(item.type)}</Text>
                  </View>
                </View>
                {item.dishes?.length > 0 && (
                  <Text style={styles.dishCount}>{item.dishes.length} platillo(s)</Text>
                )}
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
            {item.dishes?.length > 0 && (
              <View style={styles.dishList}>
                {item.dishes.map(d => (
                  <Text key={d._id} style={styles.dishItem}>• {d.name}</Text>
                ))}
              </View>
            )}
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Nuevo menú</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay menús" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} menú</Text>

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
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.chipRow}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, menuType === t.key && styles.chipActive]}
                  onPress={() => setMenuType(t.key)}
                >
                  <Text style={[styles.chipText, menuType === t.key && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Platillos (opcional)</Text>
            {dishes.length === 0 ? (
              <Text style={styles.loadingText}>No hay platillos disponibles</Text>
            ) : (
              <View style={styles.dishSelectList}>
                {dishes.map(d => {
                  const sel = selectedDishes.includes(d._id);
                  return (
                    <TouchableOpacity
                      key={d._id}
                      style={[styles.dishItemSelect, sel && styles.dishItemSelectActive]}
                      onPress={() => toggleDish(d._id)}
                    >
                      <MaterialIcons
                        name={sel ? "check-box" : "check-box-outline-blank"}
                        size={20}
                        color={sel ? COLORS.primary : COLORS.secondary}
                      />
                      <View style={styles.dishSelectInfo}>
                        <Text style={[styles.dishSelectName, sel && styles.dishSelectNameActive]}>{d.name}</Text>
                        <Text style={styles.dishSelectPrice}>Q{d.price}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={styles.label}>Válido desde (opcional)</Text>
            <TextInput style={styles.input} value={validFrom} onChangeText={setValidFrom} placeholder="2026-07-01T00:00" />
            <Text style={styles.label}>Válido hasta (opcional)</Text>
            <TextInput style={styles.input} value={validUntil} onChangeText={setValidUntil} placeholder="2026-07-31T23:59" />

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
  desc: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  meta: { flexDirection: "row", gap: SPACING.sm, marginTop: 4, alignItems: "center" },
  typeBadge: { backgroundColor: COLORS.primary + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  dishCount: { fontSize: 11, color: COLORS.secondary, marginTop: 2 },
  actions: { gap: 8 },
  actionBtn: { padding: 6 },
  dishList: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  dishItem: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, maxHeight: "90%" },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.md, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  loadingText: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontStyle: "italic" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.text, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  dishSelectList: { gap: 6 },
  dishItemSelect: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  dishItemSelectActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "08" },
  dishSelectInfo: { flex: 1 },
  dishSelectName: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text },
  dishSelectNameActive: { color: COLORS.primary },
  dishSelectPrice: { fontSize: 11, color: COLORS.secondary },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
});

export default AdminMenusScreen;
