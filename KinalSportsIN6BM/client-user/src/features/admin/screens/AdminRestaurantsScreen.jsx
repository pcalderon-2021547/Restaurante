import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, Image, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import GoldInput from "../../../shared/components/ui/GoldInput";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const CATEGORY_FILTERS = ["Todas", "Tradicional", "Italiana", "Mexicana", "China", "Japonesa", "Mariscos", "Parrilla", "Cafetería", "Rápida", "Otros"];

const AdminRestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("todos");

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

  const filtered = restaurants.filter((r) => {
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todas" || r.category === catFilter;
    const matchStatus = statusFilter === "todos" || (statusFilter === "activos" && r.isActive !== false) || (statusFilter === "inactivos" && r.isActive === false);
    return matchSearch && matchCat && matchStatus;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Restaurantes</Text>
          <Text style={styles.headerSub}>{restaurants.length} registrados</Text>
        </View>
        <TouchableOpacity style={styles.addFab} onPress={openCreate} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color={COLORS.obsidian} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o categoría..."
          placeholderTextColor={COLORS.placeholder}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={["todos", "activos", "inactivos"]}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusFilters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.statusChip, statusFilter === item && styles.statusChipActive]}
            onPress={() => setStatusFilter(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item === "todos" ? "apps-outline" : item === "activos" ? "checkmark-circle-outline" : "close-circle-outline"}
              size={13}
              color={statusFilter === item ? COLORS.gold : COLORS.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusChipText, statusFilter === item && styles.statusChipTextActive]}>
              {item === "todos" ? "Todos" : item === "activos" ? "Activos" : "Inactivos"}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        horizontal
        data={CATEGORY_FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catFilters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, catFilter === item && styles.catChipActive]}
            onPress={() => setCatFilter(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.catChipText, catFilter === item && styles.catChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <LinearGradient
            colors={[COLORS.surface, COLORS.warmDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.restCard}
          >
            <View style={styles.cardTop}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.restImage} />
              ) : (
                <View style={[styles.restImagePlaceholder, { backgroundColor: "rgba(201,168,76,0.08)" }]}>
                  <Ionicons name="storefront-outline" size={28} color={COLORS.textMuted} />
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.restName} numberOfLines={1}>{item.name}</Text>
                  <Badge text={item.isActive === false ? "Inactivo" : "Activo"} variant={item.isActive === false ? "danger" : "success"} />
                </View>
                <Text style={styles.restCategory}>{item.category}</Text>
                <View style={styles.restMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={12} color={COLORS.gold} />
                    <Text style={styles.metaText}>{item.averageRating?.toFixed(1) || "N/A"}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>Q{item.averagePrice || 0} prom.</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.openingHour}-{item.closingHour}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cardAddress}>
              <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AdminOrders")}>
                <Ionicons name="receipt-outline" size={16} color={COLORS.info} />
                <Text style={styles.actionText}>Ver Pedidos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AdminDishes")}>
                <Ionicons name="restaurant-outline" size={16} color={COLORS.success} />
                <Text style={styles.actionText}>Ver Menú</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnIcon} onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={16} color={COLORS.gold} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnIcon} onPress={() => handleDelete(item._id)}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name={search || catFilter !== "Todas" || statusFilter !== "todos" ? "search-outline" : "storefront-outline"} size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>{search || catFilter !== "Todas" || statusFilter !== "todos" ? "Sin resultados con esos filtros" : "No hay restaurantes"}</Text>
          </View>
        }
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerTitle: { fontFamily: "serif", fontSize: 24, color: COLORS.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addFab: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.gold,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: COLORS.goldLight,
    ...SHADOWS.sm,
  },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.warmDark, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.borderLight, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, padding: 0 },

  statusFilters: { gap: 8, paddingBottom: 8 },
  statusChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8,
  },
  statusChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  statusChipText: { fontSize: 12, color: COLORS.textMuted },
  statusChipTextActive: { color: COLORS.gold },

  catFilters: { gap: 8, paddingVertical: 10 },
  catChip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8,
  },
  catChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  catChipText: { fontSize: 12, color: COLORS.textMuted },
  catChipTextActive: { color: COLORS.gold },

  restCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.sm,
  },
  cardTop: { flexDirection: "row", gap: 12 },
  restImage: { width: 60, height: 60, borderRadius: 12 },
  restImagePlaceholder: { width: 60, height: 60, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  restName: { fontSize: 16, color: COLORS.text, fontWeight: "700", flex: 1 },
  restCategory: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 },
  restMeta: { flexDirection: "row", gap: 12, marginTop: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11, color: COLORS.textMuted },

  cardAddress: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  addressText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },

  cardActions: { flexDirection: "row", gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: COLORS.borderLight,
  },
  actionText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  actionBtnIcon: { padding: 6, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: COLORS.borderLight, marginLeft: "auto" },

  empty: { alignItems: "center", paddingTop: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(201,168,76,0.06)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: "center" },
});

export default AdminRestaurantsScreen;