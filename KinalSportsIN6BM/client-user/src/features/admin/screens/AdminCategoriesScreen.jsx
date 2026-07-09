import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const AdminCategoriesScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userClient.get("/category");
      if (data.success) setItems(data.categories);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null); setName(""); setDescription("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item); setName(item.name); setDescription(item.description || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Error", "Nombre obligatorio"); return; }
    const body = { name: name.trim(), description: description.trim() };
    try {
      if (editing) {
        await userClient.put(`/category/update/${editing._id}`, body);
      } else {
        await userClient.post("/category/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar esta categoría?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/category/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
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
              <View style={styles.iconBox}>
                <MaterialIcons name="category" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
                <View style={[styles.activeBadge, item.isActive ? styles.active : styles.inactive]}>
                  <Text style={[styles.activeText, { color: item.isActive ? COLORS.success : COLORS.error }]}>
                    {item.isActive ? "Activa" : "Inactiva"}
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
            <Text style={styles.addBtnText}>Nueva categoría</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay categorías" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nueva"} categoría</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} value={description} onChangeText={setDescription} multiline />
            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
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
  iconBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.primary + "15", justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  desc: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  activeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  active: { backgroundColor: COLORS.success + "20" },
  inactive: { backgroundColor: COLORS.error + "20" },
  activeText: { fontSize: 11, fontWeight: "600" },
  actions: { gap: 8 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
});

export default AdminCategoriesScreen;
