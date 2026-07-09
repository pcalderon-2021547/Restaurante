import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../shared/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

import DashboardScreen from "../features/admin/screens/DashboardScreen";
import UsersScreen from "../features/admin/screens/UsersScreen";
import RestaurantsScreen from "../features/admin/screens/RestaurantsScreen";
import AdminTablesScreen from "../features/admin/screens/AdminTablesScreen";
import AdminCategoriesScreen from "../features/admin/screens/AdminCategoriesScreen";
import AdminProductsScreen from "../features/admin/screens/AdminProductsScreen";
import AdminDishesScreen from "../features/admin/screens/AdminDishesScreen";
import AdminMenusScreen from "../features/admin/screens/AdminMenusScreen";
import AdminEventsScreen from "../features/admin/screens/AdminEventsScreen";
import AdminAllReservationsScreen from "../features/admin/screens/AdminAllReservationsScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import MyReservationsScreen from "../features/home/screens/MyReservationsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminHome" component={DashboardScreen} options={{ title: "Dashboard" }} />
    <Stack.Screen name="UsersList" component={UsersScreen} options={{ title: "Usuarios" }} />
    <Stack.Screen name="RestaurantsList" component={RestaurantsScreen} options={{ title: "Restaurantes" }} />
    <Stack.Screen name="AdminReservations" component={AdminAllReservationsScreen} options={{ title: "Reservaciones" }} />
    <Stack.Screen name="AdminTables" component={AdminTablesScreen} options={{ title: "Mesas" }} />
    <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: "Categorías" }} />
    <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: "Productos" }} />
    <Stack.Screen name="AdminDishes" component={AdminDishesScreen} options={{ title: "Platillos" }} />
    <Stack.Screen name="AdminMenus" component={AdminMenusScreen} options={{ title: "Menús" }} />
    <Stack.Screen name="AdminEvents" component={AdminEventsScreen} options={{ title: "Eventos" }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AdminProfileHome" component={ProfileScreen} options={{ title: "Perfil" }} />
    <Stack.Screen name="MyReservations" component={MyReservationsScreen} options={{ title: "Mis reservaciones" }} />
  </Stack.Navigator>
);

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#C62828",
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = "dashboard";
          else if (route.name === "AdminProfile") iconName = "person";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileStack}
        options={{ title: "Perfil", headerShown: true }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
