import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const AdminDishesScreen = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        userClient.get("/dish"),
        userClient.get("/category"),
      ]);
      if (dRes.data.success) setItems(dRes.data.dishes);
      if (cRes.data.success) setCategories(cRes.data.categories);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null); setName(""); setDescription(""); setPrice(""); setCategory("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setDescription(item.description || "");
    setPrice(String(item.price)); setCategory(item.category?._id || item.category || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price) { Alert.alert("Error", "Nombre y precio obligatorios"); return; }
    const body = { name: name.trim(), description: description.trim(), price: parseFloat(price) };
    if (category) body.category = category;
    try {
      if (editing) {
        await userClient.put(`/dish/update/${editing._id}`, body);
      } else {
        await userClient.post("/dish/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar este platillo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/dish/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const catName = (id) => categories.find(c => c._id === id)?.name || "—";

  if (loading && !items.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: item.isAvailable !== false ? COLORS.success + "20" : COLORS.error + "20" }]}>
                <MaterialIcons name="restaurant-menu" size={24} color={item.isAvailable !== false ? COLORS.success : COLORS.error} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <View style={styles.meta}>
                  <Text style={styles.price}>Q{item.price}</Text>
                  <Text style={styles.cat}>{item.category?.name || catName(item.category) || "—"}</Text>
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
            <Text style={styles.addBtnText}>Nuevo platillo</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay platillos" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} platillo</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} value={description} onChangeText={setDescription} multiline />
            <Text style={styles.label}>Precio (Q)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            <Text style={styles.label}>Categoría (ID)</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="ID de categoría" />
            {categories.length > 0 && (
              <View style={styles.catList}>
                <Text style={styles.catHint}>Categorías disponibles:</Text>
                {categories.map(c => (
                  <TouchableOpacity key={c._id} onPress={() => setCategory(c._id)} style={styles.catChip}>
                    <Text style={[styles.catChipText, category === c._id && styles.catChipActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  desc: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  meta: { flexDirection: "row", gap: SPACING.sm, marginTop: 4 },
  price: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary },
  cat: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, alignSelf: "flex-end" },
  actions: { gap: 8 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, maxHeight: "90%" },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  catList: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: SPACING.sm },
  catHint: { fontSize: 11, color: COLORS.secondary, width: "100%", marginBottom: 4 },
  catChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { color: COLORS.primary, fontWeight: "700" },
  catChipText: { fontSize: 12, color: COLORS.text },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
});

export default AdminDishesScreen;
