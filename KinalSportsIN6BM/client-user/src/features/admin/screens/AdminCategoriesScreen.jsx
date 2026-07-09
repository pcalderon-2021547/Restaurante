import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Switch } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import GoldInput from "../../../shared/components/ui/GoldInput";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const AdminCategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getCategories();
      setCategories(res.data?.categories || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setDescription(""); setModalVisible(true); };
  const openEdit = (cat) => { setEditing(cat); setName(cat.name); setDescription(cat.description || ""); setModalVisible(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) await restaurantService.updateCategory(editing._id, { name, description });
      else await restaurantService.createCategory({ name, description });
      setModalVisible(false);
      load();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await restaurantService.deleteCategory(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); }
      }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nueva Categoría" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                <GoldButton title="Eliminar" onPress={() => handleDelete(item._id)} small />
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay categorías" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Categoría" : "Nueva Categoría"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción" />
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  desc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminCategoriesScreen;