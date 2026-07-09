import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import DangerButton from "../../../shared/components/ui/DangerButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const DELIVERY_STATUS_LABELS = {
  pending_acceptance: "Pendiente de aceptación",
  accepted: "Aceptado",
  preparing: "Preparando",
  ready_for_delivery: "Listo para entrega",
  in_transit: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
  failed_delivery: "Entrega fallida",
};

const OrderDetailScreen = ({ route, navigation }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [details, setDetails] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [detailRes, deliveriesRes] = await Promise.all([
          restaurantService.getOrderDetailsByOrder(initialOrder._id).catch(() => ({ data: { details: [] } })),
          initialOrder.type === "delivery" ? restaurantService.getDeliveries().catch(() => ({ data: [] })) : { data: [] },
        ]);
        setDetails(detailRes.data?.details || []);
        if (initialOrder.type === "delivery") {
          const all = Array.isArray(deliveriesRes.data) ? deliveriesRes.data : deliveriesRes.data?.deliveries || [];
          const match = all.find((d) => d.order === initialOrder._id);
          setDelivery(match || null);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [initialOrder._id, initialOrder.type]);

  const handleCancel = () => {
    Alert.alert("Cancelar Pedido", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar", style: "destructive",
        onPress: async () => {
          try {
            await restaurantService.updateOrder(order._id, { status: "cancelled" });
            setOrder({ ...order, status: "cancelled" });
            Alert.alert("Pedido cancelado");
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "No se pudo cancelar");
          }
        },
      },
    ]);
  };

  const handleConfirmDelivery = async () => {
    try {
      await restaurantService.confirmDelivery(delivery._id);
      Alert.alert("Entrega confirmada");
      const res = await restaurantService.getDeliveries();
      const all = Array.isArray(res.data) ? res.data : res.data?.deliveries || [];
      const match = all.find((d) => d.order === order._id);
      setDelivery(match || null);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al confirmar");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper scroll>
      <View style={styles.header}>
        <Text style={styles.id}>#{order._id?.slice(-6)}</Text>
        <StatusBadge status={order.status} />
      </View>

      <Card style={{ marginBottom: 12 }}>
        <Text style={styles.label}>Tipo</Text>
        <Text style={styles.value}>{order.type === "dine_in" ? "Presencial" : order.type === "delivery" ? "Delivery" : "Para llevar"}</Text>
        {order.address ? <><Text style={styles.label}>Dirección</Text><Text style={styles.value}>{order.address}</Text></> : null}
      </Card>

      {delivery && (
        <Card style={{ marginBottom: 12, borderColor: COLORS.gold }}>
          <Text style={styles.sectionTitle}>🚚 Estado del Delivery</Text>
          <StatusBadge status={delivery.status} />
          <Text style={styles.label}>Estado actual</Text>
          <Text style={styles.value}>{DELIVERY_STATUS_LABELS[delivery.status] || delivery.status}</Text>
          {delivery.deliveryPerson && (
            <>
              <Text style={styles.label}>Repartidor asignado</Text>
              <Text style={styles.value}>{delivery.deliveryPerson}</Text>
            </>
          )}
          {delivery.deliveryPersonContact && (
            <>
              <Text style={styles.label}>Contacto</Text>
              <Text style={styles.value}>{delivery.deliveryPersonContact}</Text>
            </>
          )}
          {delivery.estimatedDeliveryTime && (
            <>
              <Text style={styles.label}>Tiempo estimado</Text>
              <Text style={styles.value}>{delivery.estimatedDeliveryTime} min</Text>
            </>
          )}
          {delivery.paymentMethod && (
            <>
              <Text style={styles.label}>Método de pago</Text>
              <Text style={styles.value}>{delivery.paymentMethod}</Text>
            </>
          )}
          {delivery.status === "in_transit" && (
            <GoldButton title="Confirmar entrega" onPress={handleConfirmDelivery} style={{ marginTop: 12 }} />
          )}
        </Card>
      )}

      {order.type === "delivery" && !delivery && order.status !== "cancelled" && (
        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>🚚 Delivery</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>El delivery aún no ha sido creado. El restaurante lo preparará pronto.</Text>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Detalle del pedido</Text>
      {details.length === 0 ? (
        <Text style={{ color: COLORS.textMuted, textAlign: "center", padding: 20 }}>Sin detalle disponible</Text>
      ) : (
        details.map((d, i) => (
          <Card key={d._id || i} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.itemName}>{d.dish?.name || d.name || `Plato #${i + 1}`}</Text>
              <Text style={styles.itemQty}>x{d.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>Q{d.subtotal?.toFixed(2) || (d.price * d.quantity).toFixed(2)}</Text>
          </Card>
        ))
      )}

      <Card style={{ marginTop: 8 }}>
        <Text style={styles.totalRow}>Subtotal: <Text style={styles.totalVal}>Q{order.subtotal?.toFixed(2)}</Text></Text>
        <Text style={styles.totalRow}>IVA: <Text style={styles.totalVal}>Q{order.tax?.toFixed(2)}</Text></Text>
        <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 6 }} />
        <Text style={[styles.totalRow, { fontSize: 16 }]}>Total: <Text style={[styles.totalVal, { color: COLORS.gold, fontSize: 18 }]}>Q{order.total?.toFixed(2)}</Text></Text>
      </Card>

      {(order.status === "pending" || order.status === "preparing") && (
        <DangerButton title="Cancelar Pedido" onPress={handleCancel} style={{ marginTop: 16 }} />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  id: { fontFamily: "serif", fontSize: 22, color: COLORS.text },
  label: { fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: "600", marginTop: 8 },
  value: { fontSize: 14, color: COLORS.text, marginTop: 2 },
  sectionTitle: { fontSize: 14, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  itemName: { fontSize: 14, color: COLORS.text, fontWeight: "600", flex: 1 },
  itemQty: { fontSize: 13, color: COLORS.textMuted },
  itemPrice: { fontSize: 13, color: COLORS.gold, fontWeight: "700", marginTop: 2 },
  totalRow: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  totalVal: { color: COLORS.text, fontWeight: "600" },
});

export default OrderDetailScreen;
