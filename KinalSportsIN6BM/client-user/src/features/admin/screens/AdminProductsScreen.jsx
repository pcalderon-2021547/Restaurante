import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const AdminProductsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [restockModal, setRestockModal] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmt, setRestockAmt] = useState("");
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userClient.get("/product");
      if (data.success) setItems(data.products);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null); setName(""); setStock(""); setCost(""); setCategory("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item); setName(item.name); setStock(String(item.stock)); setCost(String(item.cost)); setCategory(item.category || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !stock || !cost) { Alert.alert("Error", "Nombre, stock y costo obligatorios"); return; }
    const body = { name: name.trim(), stock: parseInt(stock), cost: parseFloat(cost), category: category.trim() || "General" };
    try {
      if (editing) {
        await userClient.put(`/product/update/${editing._id}`, body);
      } else {
        await userClient.post("/product/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar este producto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/product/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const openRestock = (item) => {
    setRestockTarget(item);
    setRestockAmt("");
    setRestockModal(true);
  };

  const handleRestock = async () => {
    if (!restockAmt || parseInt(restockAmt) < 1) { Alert.alert("Error", "Cantidad inválida"); return; }
    try {
      await userClient.put(`/product/restock/${restockTarget._id}`, { amount: parseInt(restockAmt) });
      setRestockModal(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al reabastecer");
    }
  };

  if (loading && !items.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: item.stock > 10 ? COLORS.success + "20" : item.stock > 0 ? COLORS.warning + "20" : COLORS.error + "20" }]}>
                <MaterialIcons name="inventory" size={24} color={item.stock > 10 ? COLORS.success : item.stock > 0 ? COLORS.warning : COLORS.error} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc}>Stock: {item.stock} | Costo: Q{item.cost?.toFixed(2)}</Text>
                {item.category && <Text style={styles.cat}>{item.category}</Text>}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openRestock(item)} style={styles.actionBtn}>
                  <MaterialIcons name="add-shopping-cart" size={20} color={COLORS.success} />
                </TouchableOpacity>
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
            <Text style={styles.addBtnText}>Nuevo producto</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay productos" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} producto</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Stock</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="number-pad" />
            <Text style={styles.label}>Costo unitario (Q)</Text>
            <TextInput style={styles.input} value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
            <Text style={styles.label}>Categoría</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} />
            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={restockModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Reabastecer: {restockTarget?.name}</Text>
            <Text style={styles.label}>Stock actual: {restockTarget?.stock}</Text>
            <Text style={styles.label}>Cantidad a agregar</Text>
            <TextInput style={styles.input} value={restockAmt} onChangeText={setRestockAmt} keyboardType="number-pad" />
            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setRestockModal(false)} style={{ flex: 1 }} />
              <Button title="Agregar" onPress={handleRestock} style={{ flex: 1 }} />
            </View>
          </View>
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
  cat: { fontSize: 11, color: COLORS.primary, fontWeight: "600", marginTop: 2 },
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
});

export default AdminProductsScreen;
