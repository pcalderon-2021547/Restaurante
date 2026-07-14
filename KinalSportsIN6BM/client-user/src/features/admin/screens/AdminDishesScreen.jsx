import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
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

const AdminDishesScreen = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState(""); const [price, setPrice] = useState(""); const [desc, setDesc] = useState(""); const [cat, setCat] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        restaurantService.getDishes().catch(() => ({ data: { dishes: [] } })),
        restaurantService.getCategories().catch(() => ({ data: { categories: [] } })),
      ]);
      setDishes(dRes.data?.dishes || []);
      setCategories(cRes.data?.categories || []);
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setPrice(""); setDesc(""); setCat(""); setModalVisible(true); };
  const openEdit = (d) => { setEditing(d); setName(d.name); setPrice(String(d.price)); setDesc(d.description || ""); setCat(d.category?._id || d.category || ""); setModalVisible(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { name, price: Number(price), description: desc, category: cat };
      if (editing) await restaurantService.updateDish(editing._id, data);
      else await restaurantService.createDish(data);
      setModalVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { try { await restaurantService.deleteDish(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); } }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const catName = (id) => categories.find((c) => c._id === id)?.name || "Sin categoría";

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nuevo Plato" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={dishes}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>{catName(item.category?._id || item.category)}</Text>
                {item.description ? <Text style={styles.detail}>{item.description}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={styles.price}>Q{item.price?.toFixed(2)}</Text>
                <Badge text={item.isAvailable ? "Disponible" : "No disponible"} variant={item.isAvailable ? "success" : "danger"} />
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                  <GoldButton title="Eliminar" onPress={() => handleDelete(item._id)} small />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay platos" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Plato" : "Nuevo Plato"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Precio" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
        <GoldInput label="Descripción" value={desc} onChangeText={setDesc} placeholder="Descripción" />
        <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>Categoría</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c._id} onPress={() => setCat(c._id)}
              style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: cat === c._id ? COLORS.gold : COLORS.border, backgroundColor: cat === c._id ? "rgba(201,168,76,0.1)" : "transparent" }}
            >
              <Text style={{ fontSize: 12, color: cat === c._id ? COLORS.gold : COLORS.textMuted }}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  price: { fontSize: 16, color: COLORS.gold, fontWeight: "700" },
});

export default AdminDishesScreen;