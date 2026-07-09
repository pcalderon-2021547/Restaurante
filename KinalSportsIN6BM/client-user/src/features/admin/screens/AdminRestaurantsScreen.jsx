import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
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

const AdminRestaurantsScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(""); const [email, setEmail] = useState(""); const [category, setCategory] = useState("");
  const [avgPrice, setAvgPrice] = useState(""); const [openH, setOpenH] = useState(""); const [closeH, setCloseH] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permiso requerido", "Se necesita acceso a la galería");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getRestaurants(); setRestaurants(res.data?.restaurants || []); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null); setName(""); setDesc(""); setAddress(""); setPhone(""); setEmail(""); setCategory(""); setAvgPrice(""); setOpenH(""); setCloseH("");
    setImageUri(null); setModalVisible(true);
  };
  const openEdit = (r) => {
    setEditing(r); setName(r.name); setDesc(r.description); setAddress(r.address); setPhone(r.phone); setEmail(r.email);
    setCategory(r.category); setAvgPrice(String(r.averagePrice)); setOpenH(r.openingHour); setCloseH(r.closingHour);
    setImageUri(null); setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { name, description: desc, address, phone, email, category, averagePrice: Number(avgPrice), openingHour: openH, closingHour: closeH };
      if (imageUri) {
        if (editing) await restaurantService.updateRestaurantWithImage(editing._id, data, imageUri);
        else await restaurantService.createRestaurantWithImage(data, imageUri);
      } else {
        if (editing) await restaurantService.updateRestaurant(editing._id, data);
        else await restaurantService.createRestaurant(data);
      }
      setModalVisible(false); load();
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar Restaurante", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => { try { await restaurantService.deleteRestaurant(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); } }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nuevo Restaurante" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>📍 {item.address}</Text>
                <Text style={styles.detail}>📞 {item.phone}</Text>
                <Text style={styles.detail}>📧 {item.email}</Text>
                <Text style={styles.detail}>🕐 {item.openingHour} - {item.closingHour}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Badge text={item.category} variant="gold" />
                <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || "N/A"}</Text>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                  <GoldButton title="Eliminar" onPress={() => handleDelete(item._id)} small />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay restaurantes" />}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Restaurante" : "Nuevo Restaurante"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Descripción" value={desc} onChangeText={setDesc} placeholder="Descripción" />
        <GoldInput label="Dirección" value={address} onChangeText={setAddress} placeholder="Dirección" />
        <GoldInput label="Teléfono" value={phone} onChangeText={setPhone} placeholder="12345678" />
        <GoldInput label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" autoCapitalize="none" keyboardType="email-address" />
        <GoldInput label="Categoría" value={category} onChangeText={setCategory} placeholder="Ej: Tradicional" />
        <GoldInput label="Precio Promedio" value={avgPrice} onChangeText={setAvgPrice} placeholder="0" keyboardType="numeric" />
        <GoldInput label="Hora Apertura" value={openH} onChangeText={setOpenH} placeholder="08:00" />
        <GoldInput label="Hora Cierre" value={closeH} onChangeText={setCloseH} placeholder="22:00" />
        <GoldButton title={imageUri ? "Cambiar imagen" : "Agregar imagen"} onPress={pickImage} style={{ marginTop: 8 }} />
        {imageUri && <Image source={{ uri: imageUri }} style={{ width: "100%", height: 120, borderRadius: 6, marginTop: 8 }} resizeMode="cover" />}
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  rating: { fontSize: 13, color: COLORS.gold, fontWeight: "700" },
});

export default AdminRestaurantsScreen;