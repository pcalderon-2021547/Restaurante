import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, Switch } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const RestaurantItem = ({ item, onEdit, onDelete, onToggle }) => (
  <Card style={styles.restaurantCard}>
    <View style={styles.cardHeader}>
      <View style={[styles.avatar, { backgroundColor: item.isActive ? COLORS.success + "20" : COLORS.error + "20" }]}>
        <MaterialIcons name="restaurant" size={24} color={item.isActive ? COLORS.success : COLORS.error} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.category}>{item.category || "Sin categoría"}</Text>
        <Text style={styles.detail}>{item.address}</Text>
        <Text style={styles.detail}>{item.phone} {item.email ? `| ${item.email}` : ""}</Text>
        <Text style={styles.price}>Q{item.averagePrice || 0} promedio</Text>
        {item.averageRating > 0 && (
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)} ({item.totalReviews || 0})</Text>
          </View>
        )}
      </View>
      <View style={styles.statusSection}>
        <Switch
          value={item.isActive}
          onValueChange={() => onToggle(item._id, item.isActive)}
          trackColor={{ false: COLORS.border, true: COLORS.success + "60" }}
          thumbColor={item.isActive ? COLORS.success : COLORS.textLight}
        />
      </View>
    </View>
    <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.actionChip} onPress={() => onEdit(item)}>
        <MaterialIcons name="edit" size={16} color={COLORS.primary} />
        <Text style={styles.actionText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionChip} onPress={() => onDelete(item)}>
        <MaterialIcons name="delete" size={16} color={COLORS.error} />
        <Text style={[styles.actionText, { color: COLORS.error }]}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

const RestaurantsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [opening, setOpening] = useState("");
  const [closing, setClosing] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userClient.get("/restaurant");
      if (data.success) setItems(data.restaurants);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setDescription(""); setAddress(""); setPhone(""); setEmail("");
    setCategory(""); setAvgPrice(""); setOpening(""); setClosing("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setDescription(item.description || ""); setAddress(item.address || "");
    setPhone(item.phone || ""); setEmail(item.email || ""); setCategory(item.category || "");
    setAvgPrice(String(item.averagePrice || "")); setOpening(item.openingHour || ""); setClosing(item.closingHour || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Error", "Nombre obligatorio"); return; }
    const body = {
      name: name.trim(), description: description.trim(), address: address.trim(),
      phone: phone.trim(), email: email.trim(), category: category.trim(),
      averagePrice: avgPrice ? parseFloat(avgPrice) : 0,
      openingHour: opening.trim(), closingHour: closing.trim(),
    };
    try {
      if (editing) {
        await userClient.put(`/restaurant/update/${editing._id}`, body);
      } else {
        await userClient.post("/restaurant/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (item) => {
    Alert.alert("Eliminar", `¿Eliminar "${item.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/restaurant/delete/${item._id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const handleToggle = async (id, current) => {
    setItems(prev => prev.map(r => r._id === id ? { ...r, isActive: !current } : r));
    try {
      await userClient.put(`/restaurant/update/${id}`, { isActive: !current });
    } catch {
      setItems(prev => prev.map(r => r._id === id ? { ...r, isActive: current } : r));
    }
  };

  if (loading && !items.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RestaurantItem item={item} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <MaterialIcons name="add-business" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Nuevo restaurante</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay restaurantes" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <FlatList
            data={[{}]}
            renderItem={() => (
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} restaurante</Text>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
                <Text style={styles.label}>Descripción</Text>
                <TextInput style={[styles.input, { minHeight: 60 }]} value={description} onChangeText={setDescription} multiline />
                <Text style={styles.label}>Dirección</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} />
                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
                <Text style={styles.label}>Categoría</Text>
                <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Ej: Parrilla, Italiano..." />
                <Text style={styles.label}>Precio promedio (Q)</Text>
                <TextInput style={styles.input} value={avgPrice} onChangeText={setAvgPrice} keyboardType="decimal-pad" />
                <Text style={styles.label}>Horario apertura</Text>
                <TextInput style={styles.input} value={opening} onChangeText={setOpening} placeholder="12:00" />
                <Text style={styles.label}>Horario cierre</Text>
                <TextInput style={styles.input} value={closing} onChangeText={setClosing} placeholder="23:00" />
                <View style={styles.modalBtns}>
                  <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
                  <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
                </View>
              </View>
            )}
            keyExtractor={() => "form"}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 10, marginBottom: SPACING.md },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: FONT_SIZE.md },
  restaurantCard: {},
  cardHeader: { flexDirection: "row", gap: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1 },
  restaurantName: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text },
  category: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: "600", textTransform: "uppercase", marginTop: 2 },
  detail: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  price: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { fontSize: FONT_SIZE.xs, fontWeight: "600", color: COLORS.secondary },
  statusSection: { alignItems: "center", justifyContent: "center" },
  actionsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.background },
  actionText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
});

export default RestaurantsScreen;
