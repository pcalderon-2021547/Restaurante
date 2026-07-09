import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const AdminDishesScreen = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, cRes, rRes, pRes] = await Promise.all([
        userClient.get("/dish"),
        userClient.get("/category"),
        userClient.get("/restaurant"),
        userClient.get("/product"),
      ]);
      if (dRes.data.success) setItems(dRes.data.dishes);
      if (cRes.data.success) setCategories(cRes.data.categories);
      if (rRes.data.success) setRestaurants(rRes.data.restaurants);
      if (pRes.data.success) setProducts(pRes.data.products);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setDescription(""); setPrice(""); setCategory(""); setRestaurantId("");
    setSelectedProducts([]);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setDescription(item.description || "");
    setPrice(String(item.price));
    setCategory(item.category?._id || item.category || "");
    setRestaurantId(item.restaurant?._id || item.restaurant || "");
    setSelectedProducts(
      (item.products || []).map(p => ({
        productId: p.product?._id || p.product,
        quantity: p.quantity || 1,
        name: p.product?.name || "",
      }))
    );
    setModalVisible(true);
  };

  const toggleProduct = (prodId, prodName) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.productId === prodId);
      if (exists) return prev.filter(p => p.productId !== prodId);
      return [...prev, { productId: prodId, quantity: 1, name: prodName }];
    });
  };

  const updateProductQty = (prodId, qty) => {
    setSelectedProducts(prev =>
      prev.map(p => p.productId === prodId ? { ...p, quantity: Math.max(1, parseInt(qty) || 1) } : p)
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !price) { Alert.alert("Error", "Nombre y precio obligatorios"); return; }
    if (!restaurantId) { Alert.alert("Error", "Debes seleccionar un restaurante"); return; }
    const body = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      restaurant: restaurantId,
    };
    if (category) body.category = category;
    if (selectedProducts.length > 0) {
      body.products = selectedProducts.map(p => ({ product: p.productId, quantity: p.quantity }));
    }
    try {
      if (editing) {
        await userClient.put(`/dish/update/${editing._id}`, body);
      } else {
        await userClient.post("/dish/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar", "¿Eliminar este platillo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userClient.delete(`/dish/delete/${id}`); fetch(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error"); }
      }},
    ]);
  };

  const catName = (id) => categories.find(c => c._id === id)?.name || "—";
  const restName = (id) => restaurants.find(r => r._id === id)?.name || "—";

  if (loading && !items.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(t) => t._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: item.isAvailable !== false ? COLORS.success + "20" : COLORS.error + "20" }]}>
                <MaterialIcons name="restaurant-menu" size={24} color={item.isAvailable !== false ? COLORS.success : COLORS.error} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.restLabel}>{restName(item.restaurant?._id || item.restaurant)}</Text>
                <View style={styles.meta}>
                  <Text style={styles.price}>Q{item.price}</Text>
                  <Text style={styles.cat}>{item.category?.name || catName(item.category) || "—"}</Text>
                </View>
                {item.products?.length > 0 && (
                  <Text style={styles.prodCount}>{item.products.length} producto(s)</Text>
                )}
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
            <Text style={styles.addBtnText}>Nuevo platillo</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay platillos" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} platillo</Text>

            <Text style={styles.label}>Restaurante *</Text>
            {restaurants.length === 0 ? (
              <Text style={styles.loadingText}>Cargando restaurantes...</Text>
            ) : (
              <View style={styles.chipRow}>
                {restaurants.map(r => (
                  <TouchableOpacity
                    key={r._id}
                    style={[styles.chip, restaurantId === r._id && styles.chipActive]}
                    onPress={() => setRestaurantId(r._id)}
                  >
                    <Text style={[styles.chipText, restaurantId === r._id && styles.chipTextActive]}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Descripción</Text>
            <TextInput style={[styles.input, { minHeight: 60 }]} value={description} onChangeText={setDescription} multiline />
            <Text style={styles.label}>Precio (Q) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

            <Text style={styles.label}>Categoría</Text>
            {categories.length > 0 && (
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !category && styles.chipActive]}
                  onPress={() => setCategory("")}
                >
                  <Text style={[styles.chipText, !category && styles.chipTextActive]}>Sin categoría</Text>
                </TouchableOpacity>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c._id}
                    style={[styles.chip, category === c._id && styles.chipActive]}
                    onPress={() => setCategory(category === c._id ? "" : c._id)}
                  >
                    <Text style={[styles.chipText, category === c._id && styles.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Productos (opcional)</Text>
            {products.length === 0 ? (
              <Text style={styles.loadingText}>No hay productos disponibles</Text>
            ) : (
              <View style={styles.productList}>
                {products.map(p => {
                  const sel = selectedProducts.find(sp => sp.productId === p._id);
                  return (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.productItem, sel && styles.productItemActive]}
                      onPress={() => toggleProduct(p._id, p.name)}
                    >
                      <View style={styles.productInfo}>
                        <Text style={[styles.productName, sel && styles.productNameActive]}>{p.name}</Text>
                        <Text style={styles.productStock}>Stock: {p.stock}</Text>
                      </View>
                      {sel && (
                        <View style={styles.qtyRow}>
                          <TouchableOpacity onPress={() => updateProductQty(p._id, sel.quantity - 1)} style={styles.qtyBtn}>
                            <MaterialIcons name="remove" size={16} color="#fff" />
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{sel.quantity}</Text>
                          <TouchableOpacity onPress={() => updateProductQty(p._id, sel.quantity + 1)} style={styles.qtyBtn}>
                            <MaterialIcons name="add" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </ScrollView>
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
  restLabel: { fontSize: 11, color: COLORS.primary, fontWeight: "600", marginTop: 2 },
  meta: { flexDirection: "row", gap: SPACING.sm, marginTop: 4 },
  price: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary },
  cat: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, alignSelf: "flex-end" },
  prodCount: { fontSize: 11, color: COLORS.secondary, marginTop: 2 },
  actions: { gap: 8 },
  actionBtn: { padding: 6 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, maxHeight: "90%" },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.md, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  loadingText: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, fontStyle: "italic" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.text, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  productList: { gap: 6 },
  productItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  productItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "08" },
  productInfo: { flex: 1 },
  productName: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text },
  productNameActive: { color: COLORS.primary },
  productStock: { fontSize: 11, color: COLORS.secondary },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  qtyValue: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text, minWidth: 20, textAlign: "center" },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
});

export default AdminDishesScreen;
