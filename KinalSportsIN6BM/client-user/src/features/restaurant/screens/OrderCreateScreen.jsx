import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import GoldInput from "../../../shared/components/ui/GoldInput";
import GoldButton from "../../../shared/components/ui/GoldButton";
import * as restaurantService from "../../../shared/api/restaurantService";
import { notifyOrderCreated } from "../../../shared/utils/notifications";

const TYPE_OPTIONS = [
  { key: "dine_in", icon: "storefront-outline", label: "Presencial" },
  { key: "delivery", icon: "bicycle-outline", label: "Delivery" },
  { key: "takeaway", icon: "bag-handle-outline", label: "Para llevar" },
];

const CartItem = ({ item, index, onUpdateQty }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handleDelta = (delta) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onUpdateQty(index, delta);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={styles.cartItem}>
        <View style={styles.cartItemLeft}>
          <Text style={styles.cartItemName}>{item.dish.name}</Text>
          <Text style={styles.cartItemPrice}>Q{(item.dish.price * item.quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.cartQtyRow}>
          <TouchableOpacity style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]} onPress={() => handleDelta(-1)} disabled={item.quantity <= 1}>
            <Ionicons name="remove" size={16} color={item.quantity <= 1 ? COLORS.textMuted : COLORS.gold} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDelta(1)}>
            <Ionicons name="add" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const OrderCreateScreen = ({ route, navigation }) => {
  const { restaurant, dish } = route.params;
  const [cart, setCart] = useState(dish ? [{ dish, quantity: 1 }] : []);
  const [type, setType] = useState("dine_in");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const updateQty = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, (newCart[index].quantity || 1) + delta);
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.dish?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleCreate = async () => {
    if (cart.length === 0) return Alert.alert("Error", "Agrega al menos un plato");
    try {
      setLoading(true);
      const items = cart.map((c) => ({ dish: c.dish._id, quantity: c.quantity }));
      const res = await restaurantService.createOrder({
        restaurant: restaurant._id,
        type,
        address: type === "delivery" ? address : undefined,
        items,
      });
      const orderId = res.data?.order?._id || res.data?._id;
      notifyOrderCreated(orderId || "000000").catch(() => {});
      Alert.alert("Éxito", "Pedido creado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al crear pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 180 }}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name={TYPE_OPTIONS.find((t) => t.key === type)?.icon || "storefront-outline"} size={18} color={COLORS.gold} />
          </View>
          <View>
            <Text style={styles.restName}>{restaurant.name}</Text>
            <Text style={styles.restAddr}>{restaurant.address}</Text>
          </View>
        </View>

        <Card style={{ marginBottom: 20 }}>
          <Text style={styles.sectionLabel}>Tipo de pedido</Text>
          <View style={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => {
              const isActive = type === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.typeChip, isActive && styles.typeChipActive]}
                  onPress={() => setType(opt.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={opt.icon} size={18} color={isActive ? COLORS.obsidian : COLORS.textMuted} />
                  <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {type === "delivery" && (
          <Card style={{ marginBottom: 20 }}>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.gold} />
              <View style={{ flex: 1 }}>
                <GoldInput label="Dirección de entrega" placeholder="Tu dirección" value={address} onChangeText={setAddress} />
              </View>
            </View>
          </Card>
        )}

        {cart.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Tu pedido ({cart.length} plato{cart.length !== 1 ? "s" : ""})</Text>
            {cart.map((item, i) => (
              <CartItem key={i} item={item} index={i} onUpdateQty={updateQty} />
            ))}
          </>
        )}

        <Card style={{ marginTop: 12 }}>
          <GoldInput label="Notas" placeholder="Alguna nota para el pedido" value={notes} onChangeText={setNotes} />
        </Card>
      </ScrollView>

      <View style={styles.stickyBar}>
        <View style={styles.stickyInfo}>
          <Text style={styles.stickyItems}>{cart.length} plato{cart.length !== 1 ? "s" : ""}</Text>
          <Text style={styles.stickyTotal}>Q{total.toFixed(2)}</Text>
        </View>
        <View style={styles.stickyBreakdown}>
          <Text style={styles.stickySub}>Subtotal Q{subtotal.toFixed(2)} + IVA Q{tax.toFixed(2)}</Text>
        </View>
        <GoldButton
          title={loading ? "Creando..." : "Confirmar Pedido"}
          onPress={handleCreate}
          loading={loading}
          disabled={cart.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(201,168,76,0.1)", alignItems: "center", justifyContent: "center" },
  restName: { fontFamily: "serif", fontSize: 22, color: COLORS.text },
  restAddr: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  sectionLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 1.1, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 12 },

  typeGrid: { flexDirection: "row", gap: 8 },
  typeChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderLight,
    backgroundColor: COLORS.warmDark,
  },
  typeChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  typeLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  typeLabelActive: { color: COLORS.obsidian, fontWeight: "700" },

  addressRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },

  cartItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: COLORS.surface, padding: 14, borderRadius: 12,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  cartItemLeft: { flex: 1 },
  cartItemName: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  cartItemPrice: { fontSize: 13, color: COLORS.gold, fontWeight: "700", marginTop: 2 },
  cartQtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center",
  },
  qtyBtnDisabled: { borderColor: COLORS.borderLight, opacity: 0.5 },
  qtyText: { fontSize: 16, fontWeight: "700", color: COLORS.text, minWidth: 20, textAlign: "center" },

  stickyBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: 16, paddingBottom: 24,
    ...SHADOWS.md,
  },
  stickyInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stickyItems: { fontSize: 13, color: COLORS.textMuted },
  stickyTotal: { fontSize: 22, fontFamily: "serif", color: COLORS.gold, fontWeight: "700" },
  stickyBreakdown: { marginBottom: 12 },
  stickySub: { fontSize: 11, color: COLORS.textMuted },
});

export default OrderCreateScreen;