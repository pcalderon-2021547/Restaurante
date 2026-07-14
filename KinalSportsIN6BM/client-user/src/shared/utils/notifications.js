import { Alert } from "react-native";

export async function requestNotificationPermission() {
  return true;
}

export async function scheduleLocalNotification(title, body, data = {}) {
  Alert.alert(title, body);
}

export async function notifyOrderCreated(orderId) {
  await scheduleLocalNotification(
    "Pedido creado",
    `Tu pedido #${orderId.slice(-6)} ha sido registrado.`,
    { type: "order", orderId }
  );
}

export async function notifyOrderStatusChanged(orderId, newStatus) {
  const labels = { pending: "Pendiente", preparing: "Preparando", ready: "Listo", delivered: "Entregado", paid: "Pagado", cancelled: "Cancelado" };
  await scheduleLocalNotification(
    "Estado del pedido actualizado",
    `Pedido #${orderId.slice(-6)}: ${labels[newStatus] || newStatus}`,
    { type: "order", orderId, status: newStatus }
  );
}

export async function notifyDeliveryAssignment(orderId) {
  await scheduleLocalNotification(
    "Repartidor asignado",
    `Se ha asignado un repartidor a tu pedido #${orderId.slice(-6)}.`,
    { type: "delivery", orderId }
  );
}

export async function notifyDeliveryStatus(deliveryId, status) {
  const labels = {
    pending_acceptance: "Pendiente de aceptación", accepted: "Aceptado",
    preparing: "Preparando", ready_for_delivery: "Listo para entrega",
    in_transit: "En camino", delivered: "Entregado",
  };
  await scheduleLocalNotification(
    "Estado del delivery",
    `Delivery #${deliveryId.slice(-6)}: ${labels[status] || status}`,
    { type: "delivery", deliveryId, status }
  );
}