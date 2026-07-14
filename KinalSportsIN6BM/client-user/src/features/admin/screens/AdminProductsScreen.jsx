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

const AdminProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [restockVisible, setRestockVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState(""); const [stock, setStock] = useState(""); const [cost, setCost] = useState(""); const [category, setCategory] = useState("");
  const [restockId, setRestockId] = useState(null); const [restockAmt, setRestockAmt] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getProducts(); setProducts(res.data?.products || []); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setStock(""); setCost(""); setCategory(""); setModalVisible(true); };
  const openEdit = (p) => { setEditing(p); setName(p.name); setStock(String(p.stock)); setCost(String(p.cost)); setCategory(p.category); setModalVisible(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) await restaurantService.updateProduct(editing._id, { name, stock: Number(stock), cost: Number(cost), category });
      else await restaurantService.createProduct({ name, stock: Number(stock), cost: Number(cost), category });
      setModalVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleToggle = (id) => {
    Alert.alert("Cambiar Estado", "¿Cambiar estado del producto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "OK", onPress: async () => { try { await restaurantService.toggleProduct(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al cambiar estado"); } }},
    ]);
  };

  const handleRestock = async () => {
    try {
      setSaving(true);
      await restaurantService.restockProduct(restockId, Number(restockAmt));
      setRestockVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const stockVariant = (s) => s <= 0 ? "danger" : s < 10 ? "warning" : "success";

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nuevo Producto" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>Categoría: {item.category}</Text>
                <Text style={styles.detail}>Costo: Q{item.cost?.toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Badge text={`Stock: ${item.stock}`} variant={stockVariant(item.stock)} />
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <GoldButton title={item.isActive ? "Desactivar" : "Activar"} onPress={() => handleToggle(item._id)} small />
                  <GoldButton title="Re-stock" onPress={() => { setRestockId(item._id); setRestockAmt(""); setRestockVisible(true); }} small />
                  <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay productos" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Producto" : "Nuevo Producto"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Stock" value={stock} onChangeText={setStock} placeholder="0" keyboardType="numeric" />
        <GoldInput label="Costo" value={cost} onChangeText={setCost} placeholder="0.00" keyboardType="decimal-pad" />
        <GoldInput label="Categoría" value={category} onChangeText={setCategory} placeholder="Ej: Bebidas" />
      </Modal>
      <Modal visible={restockVisible} onClose={() => setRestockVisible(false)} title="Re-stock" onConfirm={handleRestock} confirmText="Agregar" confirmLoading={saving}>
        <GoldInput label="Cantidad a agregar" value={restockAmt} onChangeText={setRestockAmt} placeholder="0" keyboardType="numeric" />
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminProductsScreen;