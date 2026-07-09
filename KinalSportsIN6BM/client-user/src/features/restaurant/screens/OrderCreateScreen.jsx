import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import GoldInput from "../../../shared/components/ui/GoldInput";
import GoldButton from "../../../shared/components/ui/GoldButton";
import OutlineButton from "../../../shared/components/ui/OutlineButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";
import { notifyOrderCreated } from "../../../shared/utils/notifications";

const OrderCreateScreen = ({ route, navigation }) => {
  const { restaurant, dish } = route.params;
  const [cart, setCart] = useState(dish ? [{ dish, quantity: 1 }] : []);
  const [type, setType] = useState("dine-in");
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
    <ScreenWrapper scroll>
      <Text style={styles.restName}>{restaurant.name}</Text>

      <View style={styles.typeRow}>
        {["dine-in", "delivery", "takeaway"].map((t) => (
          <OutlineButton
            key={t}
            title={{ "dine-in": "Presencial", delivery: "Delivery", takeaway: "Para llevar" }[t]}
            onPress={() => setType(t)}
            color={type === t ? COLORS.gold : COLORS.textMuted}
            small
          />
        ))}
      </View>

      {type === "delivery" && (
        <GoldInput label="Dirección de entrega" placeholder="Tu dirección" value={address} onChangeText={setAddress} />
      )}

      {cart.map((item, i) => (
        <Card key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.dish.name}</Text>
            <Text style={styles.itemPrice}>Q{(item.dish.price * item.quantity).toFixed(2)}</Text>
          </View>
          <View style={styles.qtyRow}>
            <OutlineButton title="-" onPress={() => updateQty(i, -1)} small />
            <Text style={styles.qty}>{item.quantity}</Text>
            <OutlineButton title="+" onPress={() => updateQty(i, 1)} small />
          </View>
        </Card>
      ))}

      <GoldInput label="Notas" placeholder="Alguna nota para el pedido" value={notes} onChangeText={setNotes} />

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.totalRow}>Subtotal: <Text style={styles.totalValue}>Q{subtotal.toFixed(2)}</Text></Text>
        <Text style={styles.totalRow}>IVA (12%): <Text style={styles.totalValue}>Q{tax.toFixed(2)}</Text></Text>
        <View style={styles.divider} />
        <Text style={[styles.totalRow, styles.grandTotal]}>Total: <Text style={styles.grandValue}>Q{total.toFixed(2)}</Text></Text>
      </Card>

      <GoldButton title={loading ? "Creando..." : "Confirmar Pedido"} onPress={handleCreate} loading={loading} style={{ marginTop: 16, marginBottom: 32 }} />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  restName: { fontFamily: "serif", fontSize: 24, color: COLORS.text, marginBottom: 16 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  itemName: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  itemPrice: { fontSize: 13, color: COLORS.gold, fontWeight: "700", marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qty: { fontSize: 16, color: COLORS.text, fontWeight: "700", minWidth: 24, textAlign: "center" },
  totalRow: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  totalValue: { color: COLORS.text, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  grandTotal: { fontSize: 16 },
  grandValue: { color: COLORS.gold, fontWeight: "700", fontSize: 18 },
});

export default OrderCreateScreen;