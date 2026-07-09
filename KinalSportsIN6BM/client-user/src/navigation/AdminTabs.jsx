import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../shared/constants/theme";

import AdminHomeScreen from "../features/admin/screens/AdminHomeScreen";
import AdminUsersScreen from "../features/admin/screens/AdminUsersScreen";
import AdminProductsScreen from "../features/admin/screens/AdminProductsScreen";
import AdminOrdersScreen from "../features/admin/screens/AdminOrdersScreen";
import AdminDeliveriesScreen from "../features/admin/screens/AdminDeliveriesScreen";
import AdminEventsScreen from "../features/admin/screens/AdminEventsScreen";
import AdminMoreScreen from "../features/admin/screens/AdminMoreScreen";
import AdminCategoriesScreen from "../features/admin/screens/AdminCategoriesScreen";
import AdminDishesScreen from "../features/admin/screens/AdminDishesScreen";
import AdminMenusScreen from "../features/admin/screens/AdminMenusScreen";
import AdminTablesScreen from "../features/admin/screens/AdminTablesScreen";
import AdminReservationsScreen from "../features/admin/screens/AdminReservationsScreen";
import AdminReviewsScreen from "../features/admin/screens/AdminReviewsScreen";
import AdminReportsScreen from "../features/admin/screens/AdminReportsScreen";
import AdminRestaurantsScreen from "../features/admin/screens/AdminRestaurantsScreen";

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
    <Stack.Screen name="Dishes" component={AdminDishesScreen} options={{ title: "Platos" }} />
    <Stack.Screen name="Menus" component={AdminMenusScreen} options={{ title: "Menús" }} />
    <Stack.Screen name="Tables" component={AdminTablesScreen} options={{ title: "Mesas" }} />
    <Stack.Screen name="Reservations" component={AdminReservationsScreen} options={{ title: "Reservaciones" }} />
    <Stack.Screen name="Reviews" component={AdminReviewsScreen} options={{ title: "Reseñas" }} />
    <Stack.Screen name="Reports" component={AdminReportsScreen} options={{ title: "Reportes" }} />
    <Stack.Screen name="Restaurants" component={AdminRestaurantsScreen} options={{ title: "Restaurantes" }} />
  </Stack.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.gold,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: { backgroundColor: COLORS.charcoal, borderTopColor: COLORS.borderLight, height: 60, paddingBottom: 8, paddingTop: 4 },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: "dashboard", Users: "people", Products: "inventory", Orders: "receipt-long", Deliveries: "local-shipping", Events: "event", More: "more-horiz" };
        return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={wrapInStack(AdminHomeScreen, "Dashboard")} options={{ title: "Inicio" }} />
    <Tab.Screen name="Users" component={wrapInStack(AdminUsersScreen, "Usuarios")} options={{ title: "Usuarios" }} />
    <Tab.Screen name="Products" component={wrapInStack(AdminProductsScreen, "Productos")} options={{ title: "Productos" }} />
    <Tab.Screen name="Orders" component={wrapInStack(AdminOrdersScreen, "Pedidos")} options={{ title: "Pedidos" }} />
    <Tab.Screen name="Deliveries" component={wrapInStack(AdminDeliveriesScreen, "Entregas")} options={{ title: "Delivery" }} />
    <Tab.Screen name="Events" component={wrapInStack(AdminEventsScreen, "Eventos")} options={{ title: "Eventos" }} />
    <Tab.Screen name="More" component={MoreStack} options={{ title: "Más" }} />
  </Tab.Navigator>
);

export default AdminTabs;