import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import { useAuthStore } from "../../../shared/store/authStore";

const MENU_ITEMS = [
  { name: "Categorías", screen: "Categories", icon: "pricetag-outline", color: COLORS.gold },
  { name: "Platos", screen: "Dishes", icon: "restaurant-outline", color: COLORS.success },
  { name: "Menús", screen: "Menus", icon: "book-outline", color: COLORS.info },
  { name: "Mesas", screen: "Tables", icon: "grid-outline", color: COLORS.warning },
  { name: "Reservaciones", screen: "Reservations", icon: "calendar-outline", color: COLORS.gold },
  { name: "Reseñas", screen: "Reviews", icon: "star-outline", color: COLORS.goldLight },
  { name: "Reportes", screen: "Reports", icon: "bar-chart-outline", color: COLORS.info },
  { name: "Restaurantes", screen: "Restaurants", icon: "storefront-outline", color: COLORS.gold },
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
    <ScreenWrapper scroll>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Más opciones</Text>
          <Text style={styles.headerSub}>Gestiona tu restaurante</Text>
        </View>
        <View style={styles.headerIconBg}>
          <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.gold} />
        </View>
      </View>

      <View style={styles.grid}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.screen)}
          >
            <LinearGradient
              colors={[COLORS.surface, COLORS.warmDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuCardInner}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.label}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
        <View style={styles.logoutIconWrap}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        </View>
        <Text style={styles.logoutLabel}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontFamily: "serif", fontSize: 26, color: COLORS.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  headerIconBg: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: "rgba(201,168,76,0.08)", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(201,168,76,0.15)",
  },

  grid: { gap: 10 },
  menuCard: { borderRadius: 14, overflow: "hidden", ...SHADOWS.sm },
  menuCardInner: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: 14,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  label: { fontSize: 15, color: COLORS.text, fontWeight: "600", flex: 1 },

  logoutButton: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, marginTop: 24, borderRadius: 14,
    backgroundColor: "rgba(224,90,90,0.06)", borderWidth: 1, borderColor: "rgba(224,90,90,0.2)",
  },
  logoutIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(224,90,90,0.1)", alignItems: "center", justifyContent: "center",
  },
  logoutLabel: { fontSize: 15, color: COLORS.error, fontWeight: "600", flex: 1 },
});

export default AdminMoreScreen;