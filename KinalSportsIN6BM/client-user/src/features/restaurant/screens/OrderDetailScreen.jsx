import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import DangerButton from "../../../shared/components/ui/DangerButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";
import { confirmAction } from "../../../shared/utils/confirmAction";

const STATUS_FLOW = [
  { key: "pending", icon: "create-outline", label: "Pedido creado" },
  { key: "preparing", icon: "flame-outline", label: "En preparación" },
  { key: "ready", icon: "checkmark-circle-outline", label: "Listo" },
  { key: "delivered", icon: "bicycle-outline", label: "Entregado" },
  { key: "paid", icon: "wallet-outline", label: "Pagado" },
];

const CANCELLED_STEP = { key: "cancelled", icon: "close-circle-outline", label: "Cancelado", color: COLORS.error };

const STEP_COLORS = {
  pending: COLORS.gold,
  preparing: COLORS.warning,
  ready: COLORS.info,
  delivered: COLORS.success,
  paid: COLORS.success,
  cancelled: COLORS.error,
};

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

const ORDER_ICONS = {
  dine_in: "storefront-outline",
  delivery: "bicycle-outline",
  takeaway: "bag-handle-outline",
};

const StatusTimeline = ({ status }) => {
  const isCancelled = status === "cancelled";
  const currentIndex = STATUS_FLOW.findIndex((s) => s.key === status);
  const steps = isCancelled ? [...STATUS_FLOW.slice(0, 1), CANCELLED_STEP] : STATUS_FLOW;

  return (
    <Card style={{ marginBottom: 16, paddingVertical: 20, paddingHorizontal: 20 }}>
      <Text style={styles.sectionTitle}>Estado del pedido</Text>
      <View style={styles.timeline}>
        {steps.map((step, i) => {
          const stepStatus = isCancelled
            ? (i === 0 ? "completed" : i === 1 ? "active" : "pending")
            : i < currentIndex ? "completed" : i === currentIndex ? "active" : "pending";
          const colorMap = { completed: COLORS.success, active: STEP_COLORS[step.key] || COLORS.gold, pending: COLORS.border };
          const color = colorMap[stepStatus];

          return (
            <View key={step.key} style={styles.timelineStep}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: stepStatus === "pending" ? "transparent" : color, borderColor: color }]}>
                  {stepStatus === "completed" ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Ionicons name={step.icon} size={13} color={stepStatus === "pending" ? COLORS.textMuted : "#fff"} />
                  )}
                </View>
                {i < steps.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: stepStatus === "completed" ? COLORS.success : COLORS.border }]} />
                )}
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.timelineLabel, { color: stepStatus === "pending" ? COLORS.textMuted : COLORS.text, fontWeight: stepStatus === "active" ? "700" : "400" }]}>
                  {step.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
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
    confirmAction("Cancelar Pedido", "¿Estás seguro?", async () => {
      try {
        await restaurantService.updateOrder(order._id, { status: "cancelled" });
        setOrder({ ...order, status: "cancelled" });
        Alert.alert("Pedido cancelado", "Tu pedido ha sido cancelado exitosamente.");
      } catch (err) {
        Alert.alert("Error", err.response?.data?.message || "No se pudo cancelar");
      }
    });
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
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: `rgba(201,168,76,0.1)` }]}>
            <Ionicons name={ORDER_ICONS[order.type] || "ellipse-outline"} size={20} color={COLORS.gold} />
          </View>
          <View>
            <Text style={styles.id}>Pedido #{order._id?.slice(-6)}</Text>
            <Text style={styles.headerSub}>
              {order.type === "dine_in" ? "Presencial" : order.type === "delivery" ? "Delivery" : "Para llevar"}
              {" · "}
              {new Date(order.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <StatusTimeline status={order.status} />

      {order.address ? (
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Dirección de entrega</Text>
              <Text style={styles.value}>{order.address}</Text>
            </View>
          </View>
        </Card>
      ) : null}

      {delivery ? (
        <Card style={{ marginBottom: 12, borderColor: `rgba(201,168,76,0.3)` }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bicycle-outline" size={16} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Detalle del delivery</Text>
          </View>
          <View style={styles.deliveryGrid}>
            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Estado</Text>
              <StatusBadge status={delivery.status} />
            </View>
            {delivery.deliveryPerson && (
              <>
                <View style={styles.deliveryItem}>
                  <Text style={styles.deliveryLabel}>Repartidor</Text>
                  <Text style={styles.deliveryValue}>{delivery.deliveryPerson}</Text>
                </View>
                {delivery.deliveryPersonContact && (
                  <View style={styles.deliveryItem}>
                    <Text style={styles.deliveryLabel}>Contacto</Text>
                    <Text style={styles.deliveryValue}>{delivery.deliveryPersonContact}</Text>
                  </View>
                )}
              </>
            )}
            {delivery.estimatedDeliveryTime && (
              <View style={styles.deliveryItem}>
                <Text style={styles.deliveryLabel}>Tiempo estimado</Text>
                <Text style={styles.deliveryValue}>{delivery.estimatedDeliveryTime} min</Text>
              </View>
            )}
            {delivery.paymentMethod && (
              <View style={styles.deliveryItem}>
                <Text style={styles.deliveryLabel}>Método de pago</Text>
                <Text style={styles.deliveryValue}>{delivery.paymentMethod}</Text>
              </View>
            )}
          </View>
          {delivery.status === "in_transit" && (
            <GoldButton title="Confirmar entrega" onPress={handleConfirmDelivery} style={{ marginTop: 12 }} />
          )}
        </Card>
      ) : order.type === "delivery" && order.status !== "cancelled" ? (
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bicycle-outline" size={16} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Delivery</Text>
          </View>
          <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>El delivery aún no ha sido creado. El restaurante lo preparará pronto.</Text>
        </Card>
      ) : null}

      <View style={styles.sectionHeader}>
        <Ionicons name="restaurant-outline" size={16} color={COLORS.gold} />
        <Text style={styles.sectionTitle}>Platos solicitados</Text>
      </View>

      {details.length === 0 ? (
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: COLORS.textMuted, textAlign: "center", paddingVertical: 8 }}>Sin detalle disponible</Text>
        </Card>
      ) : (
        details.map((d, i) => (
          <View key={d._id || i} style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={[styles.detailBadge, { backgroundColor: `rgba(201,168,76,0.08)` }]}>
                <Text style={styles.detailBadgeText}>{d.quantity}</Text>
              </View>
              <Text style={styles.itemName}>{d.dish?.name || d.name || `Plato #${i + 1}`}</Text>
            </View>
            <Text style={styles.itemPrice}>Q{(d.subtotal || d.price * d.quantity)?.toFixed(2)}</Text>
          </View>
        ))
      )}

      <Card style={{ marginTop: 12, marginBottom: 12 }}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalVal}>Q{order.subtotal?.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>IVA (12%)</Text>
          <Text style={styles.totalVal}>Q{order.tax?.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabelFinal}>Total</Text>
          <Text style={styles.totalValFinal}>Q{order.total?.toFixed(2)}</Text>
        </View>
      </Card>

      {(order.status === "pending" || order.status === "preparing") && (
        <DangerButton title="Cancelar Pedido" onPress={handleCancel} style={{ marginBottom: 32 }} />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  id: { fontFamily: "serif", fontSize: 20, color: COLORS.text, letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  label: { fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: "600" },
  value: { fontSize: 14, color: COLORS.text, marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 13, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  timeline: { marginTop: 8 },
  timelineStep: { flexDirection: "row", alignItems: "flex-start", minHeight: 44 },
  timelineLeft: { alignItems: "center", width: 26 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  timelineLine: { width: 2, flex: 1, minHeight: 20, marginTop: 2 },
  timelineRight: { flex: 1, marginLeft: 10, justifyContent: "center", paddingTop: 2 },
  timelineLabel: { fontSize: 13, color: COLORS.text },
  deliveryGrid: { gap: 10, marginTop: 4 },
  deliveryItem: {},
  deliveryLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: "600", marginBottom: 2 },
  deliveryValue: { fontSize: 14, color: COLORS.text },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: COLORS.surface, padding: 12, borderRadius: 10,
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  detailLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  detailBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  detailBadgeText: { fontSize: 13, fontWeight: "700", color: COLORS.gold },
  itemName: { fontSize: 14, color: COLORS.text, fontWeight: "600", flex: 1 },
  itemPrice: { fontSize: 14, color: COLORS.gold, fontWeight: "700" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { fontSize: 13, color: COLORS.textSecondary },
  totalVal: { fontSize: 13, color: COLORS.text, fontWeight: "500" },
  totalLabelFinal: { fontSize: 15, color: COLORS.text, fontWeight: "700" },
  totalValFinal: { fontSize: 18, color: COLORS.gold, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
});

export default OrderDetailScreen;
