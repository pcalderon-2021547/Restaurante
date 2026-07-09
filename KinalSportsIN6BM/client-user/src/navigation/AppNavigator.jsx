import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../shared/constants/theme";
import AuthStack from "./AuthStack";
import RestaurantTabs from "./RestaurantTabs";
import AdminTabs from "./AdminTabs";
import AdminRestaurantTabs from "./RestaurantAdminTabs";
import { useAuthStore } from "../shared/store/authStore";
import { requestNotificationPermission } from "../shared/utils/notifications";

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state._hasHydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.splashTitle}>Restaurante</Text>
        <Text style={styles.splashSub}>La mejor experiencia gastronómica</Text>
        <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === "ADMIN_ROLE" ? (
        <AdminTabs />
      ) : user?.role === "ADMIN_RESTAURANT_ROLE" ? (
        <AdminRestaurantTabs />
      ) : (
        <RestaurantTabs />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  splashTitle: {
    fontFamily: "serif",
    fontSize: 36,
    color: COLORS.gold,
    fontWeight: "700",
  },
  splashSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

export default AppNavigator;
