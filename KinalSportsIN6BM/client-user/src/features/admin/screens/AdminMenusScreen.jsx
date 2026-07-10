import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
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

const AdminMenusScreen = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [type, setType] = useState("DAILY");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getMenus(); setMenus(res.data?.menus || []); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setDesc(""); setType("DAILY"); setModalVisible(true); };
  const openEdit = (m) => { setEditing(m); setName(m.name); setDesc(m.description || ""); setType(m.type); setModalVisible(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { name, description: desc, type };
      if (editing) await restaurantService.updateMenu(editing._id, data);
      else await restaurantService.createMenu(data);
      setModalVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { try { await restaurantService.deleteMenu(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); } }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const typeLabel = { DAILY: "Diario", EVENT: "Evento", PROMOTION: "Promoción" };

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nuevo Menú" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={menus}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description ? <Text style={styles.detail}>{item.description}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Badge text={typeLabel[item.type] || item.type} variant="info" />
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                  <GoldButton title="Eliminar" onPress={() => handleDelete(item._id)} small />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay menús" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Menú" : "Nuevo Menú"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Descripción" value={desc} onChangeText={setDesc} placeholder="Descripción" />
        <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>Tipo</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {Object.entries(typeLabel).map(([key, label]) => (
            <GoldButton key={key} title={label} onPress={() => setType(key)} small style={{ width: "auto", flex: 1 }} />
          ))}
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminMenusScreen;