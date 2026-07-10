import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import { useAuthStore } from "../../../shared/store/authStore";

const MENU_ITEMS = [
  { name: "Categorías", screen: "Categories", icon: "🏷️" },
  { name: "Platos", screen: "Dishes", icon: "🍽️" },
  { name: "Menús", screen: "Menus", icon: "📋" },
  { name: "Mesas", screen: "Tables", icon: "🪑" },
  { name: "Reservaciones", screen: "Reservations", icon: "📅" },
  { name: "Reseñas", screen: "Reviews", icon: "⭐" },
  { name: "Reportes", screen: "Reports", icon: "📊" },
  { name: "Restaurantes", screen: "Restaurants", icon: "🏪" },
];

const AdminMoreScreen = ({ navigation }) => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {MENU_ITEMS.map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.label}>{item.name}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutLabel}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  menuItem: {
    flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight,
    marginBottom: 10,
  },
  icon: { fontSize: 22, marginRight: 14 },
  label: { fontSize: 16, color: COLORS.text, fontWeight: "600", flex: 1 },
  arrow: { fontSize: 22, color: COLORS.textMuted },
  logoutButton: {
    flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16,
    borderRadius: 8, backgroundColor: "rgba(220,53,69,0.1)", borderWidth: 1, borderColor: "rgba(220,53,69,0.3)",
    marginTop: 20,
  },
  logoutIcon: { fontSize: 22, marginRight: 14 },
  logoutLabel: { fontSize: 16, color: "#dc3545", fontWeight: "600", flex: 1 },
});

export default AdminMoreScreen;