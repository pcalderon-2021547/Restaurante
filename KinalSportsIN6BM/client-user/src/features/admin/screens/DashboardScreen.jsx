import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/Common";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminRestaurants } from "../hooks/useAdminRestaurants";
import { MaterialIcons } from "@expo/vector-icons";

const MENU_ITEMS = [
  { key: "UsersList", icon: "people", title: "Usuarios", desc: "Gestionar usuarios del sistema", color: "#2563eb" },
  { key: "RestaurantsList", icon: "store", title: "Restaurantes", desc: "Gestionar restaurantes", color: "#C62828" },
  { key: "AdminReservations", icon: "event-note", title: "Reservaciones", desc: "Ver todas las reservaciones", color: "#7c3aed" },
  { key: "AdminTables", icon: "table-restaurant", title: "Mesas", desc: "CRUD de mesas del restaurante", color: "#0891b2" },
  { key: "AdminCategories", icon: "category", title: "Categorías", desc: "Categorías de platillos", color: "#059669" },
  { key: "AdminProducts", icon: "inventory", title: "Productos", desc: "Inventario y reabastecimiento", color: "#d97706" },
  { key: "AdminDishes", icon: "restaurant-menu", title: "Platillos", desc: "Menú de platillos disponibles", color: "#dc2626" },
  { key: "AdminMenus", icon: "menu-book", title: "Menús", desc: "Combos y promociones", color: "#9333ea" },
  { key: "AdminEvents", icon: "event", title: "Eventos", desc: "Eventos especiales del restaurante", color: "#e11d48" },
];

const DashboardScreen = ({ navigation }) => {
  const { users, loading: usersLoading, getUsers } = useAdminUsers();
  const { restaurants, loading: restsLoading, getRestaurants } = useAdminRestaurants();

  useEffect(() => {
    getUsers();
    getRestaurants();
  }, []);

  const onRefresh = () => {
    getUsers();
    getRestaurants();
  };

  const isLoading = usersLoading && restsLoading;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Panel Admin</Text>
        <Text style={styles.subtitle}>Leña y Fuego</Text>
      </View>

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <MaterialIcons name="people" size={28} color="#2563eb" />
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </Card>
        <Card style={styles.statCard}>
          <MaterialIcons name="store" size={28} color="#C62828" />
          <Text style={styles.statNumber}>{restaurants.length}</Text>
          <Text style={styles.statLabel}>Restaurantes</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Gestión completa</Text>
      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.key} onPress={() => navigation.navigate(item.key)}>
            <Card style={styles.menuCard}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
                <MaterialIcons name={item.icon} size={26} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.secondary} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  headerRow: { marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: "600", marginTop: 2 },
  grid: { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: { flex: 1, alignItems: "center", paddingVertical: SPACING.lg, gap: 4 },
  statNumber: { fontSize: 32, fontWeight: "800", color: COLORS.text },
  statLabel: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  menu: { gap: SPACING.sm, marginBottom: SPACING.xl },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  menuDesc: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, marginTop: 2 },
});

export default DashboardScreen;
