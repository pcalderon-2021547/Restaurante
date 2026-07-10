import { View, Text } from "react-native";
import Badge from "./Badge";

const STATUS_MAP = {
  pending: "gold",
  preparing: "warning",
  ready: "info",
  delivered: "success",
  paid: "success",
  cancelled: "danger",
  confirmed: "success",
  active: "success",
  finished: "info",
  available: "success",
  occupied: "danger",
  reserved: "warning",
};

const STATUS_LABELS = {
  pending: "Pendiente", preparing: "Preparando", ready: "Listo",
  delivered: "Entregado", paid: "Pagado", cancelled: "Cancelado",
  confirmed: "Confirmado", active: "Activo", finished: "Finalizado",
  available: "Disponible", occupied: "Ocupado", reserved: "Reservado",
};

const StatusBadge = ({ status }) => (
  <Badge
    text={STATUS_LABELS[status] || status}
    variant={STATUS_MAP[status] || "gold"}
  />
);

export default StatusBadge;