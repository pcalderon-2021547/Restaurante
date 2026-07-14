import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import GoldInput from "../../../shared/components/ui/GoldInput";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const AdminTablesScreen = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [number, setNumber] = useState(""); const [capacity, setCapacity] = useState(""); const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getTables(); setTables(res.data?.tables || []); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setNumber(""); setCapacity(""); setLocation(""); setModalVisible(true); };
  const openEdit = (t) => { setEditing(t); setNumber(String(t.number)); setCapacity(String(t.capacity)); setLocation(t.location); setModalVisible(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { number: Number(number), capacity: Number(capacity), location };
      if (editing) await restaurantService.updateTable(editing._id, data);
      else await restaurantService.createTable(data);
      setModalVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar Mesa", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { try { await restaurantService.deleteTable(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); } }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nueva Mesa" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={tables}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.name}>Mesa #{item.number}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.detail}>Capacidad: {item.capacity} personas</Text>
                <Text style={styles.detail}>Ubicación: {item.location}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                <GoldButton title="Eliminar" onPress={() => handleDelete(item._id)} small />
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay mesas" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Mesa" : "Nueva Mesa"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Número" value={number} onChangeText={setNumber} placeholder="1" keyboardType="numeric" />
        <GoldInput label="Capacidad" value={capacity} onChangeText={setCapacity} placeholder="4" keyboardType="numeric" />
        <GoldInput label="Ubicación" value={location} onChangeText={setLocation} placeholder="Salón Principal" />
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminTablesScreen;