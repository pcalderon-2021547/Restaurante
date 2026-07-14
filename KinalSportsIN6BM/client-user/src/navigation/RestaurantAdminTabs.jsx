import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../shared/constants/theme";

import AdminHomeScreen from "../features/admin/screens/AdminHomeScreen";
import AdminOrdersScreen from "../features/admin/screens/AdminOrdersScreen";
import AdminDeliveriesScreen from "../features/admin/screens/AdminDeliveriesScreen";
import AdminDishesScreen from "../features/admin/screens/AdminDishesScreen";
import AdminEventsScreen from "../features/admin/screens/AdminEventsScreen";
import AdminMoreScreen from "../features/admin/screens/AdminMoreScreen";
import AdminCategoriesScreen from "../features/admin/screens/AdminCategoriesScreen";
import AdminMenusScreen from "../features/admin/screens/AdminMenusScreen";
import AdminTablesScreen from "../features/admin/screens/AdminTablesScreen";
import AdminReservationsScreen from "../features/admin/screens/AdminReservationsScreen";
import AdminReviewsScreen from "../features/admin/screens/AdminReviewsScreen";
import AdminReportsScreen from "../features/admin/screens/AdminReportsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.charcoal },
  headerTintColor: COLORS.gold,
  headerTitleStyle: { fontFamily: "serif" },
};

const wrapInStack = (Component, title) => () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="Main" component={Component} options={{ title }} />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="MoreMain" component={AdminMoreScreen} options={{ title: "Más opciones" }} />
    <Stack.Screen name="Categories" component={AdminCategoriesScreen} options={{ title: "Categorías" }} />
    <Stack.Screen name="Menus" component={AdminMenusScreen} options={{ title: "Menús" }} />
    <Stack.Screen name="Tables" component={AdminTablesScreen} options={{ title: "Mesas" }} />
    <Stack.Screen name="Reservations" component={AdminReservationsScreen} options={{ title: "Reservaciones" }} />
    <Stack.Screen name="Reviews" component={AdminReviewsScreen} options={{ title: "Reseñas" }} />
    <Stack.Screen name="Reports" component={AdminReportsScreen} options={{ title: "Reportes" }} />
  </Stack.Navigator>
);

const AdminRestaurantTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.gold,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: { backgroundColor: COLORS.charcoal, borderTopColor: COLORS.borderLight, height: 60, paddingBottom: 8, paddingTop: 4 },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: "dashboard", Orders: "receipt-long", Deliveries: "local-shipping", Dishes: "restaurant-menu", Events: "event", More: "more-horiz" };
        return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={wrapInStack(AdminHomeScreen, "Dashboard")} options={{ title: "Inicio" }} />
    <Tab.Screen name="Orders" component={wrapInStack(AdminOrdersScreen, "Pedidos")} options={{ title: "Pedidos" }} />
    <Tab.Screen name="Deliveries" component={wrapInStack(AdminDeliveriesScreen, "Entregas")} options={{ title: "Delivery" }} />
    <Tab.Screen name="Dishes" component={wrapInStack(AdminDishesScreen, "Platos")} options={{ title: "Platos" }} />
    <Tab.Screen name="Events" component={wrapInStack(AdminEventsScreen, "Eventos")} options={{ title: "Eventos" }} />
    <Tab.Screen name="More" component={MoreStack} options={{ title: "Más" }} />
  </Tab.Navigator>
);

export default AdminRestaurantTabs;
