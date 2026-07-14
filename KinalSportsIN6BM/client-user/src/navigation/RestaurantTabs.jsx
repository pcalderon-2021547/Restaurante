import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../shared/constants/theme";

import HomeScreen from "../features/restaurant/screens/HomeScreen";
import RestaurantsScreen from "../features/restaurant/screens/RestaurantsScreen";
import RestaurantDetailScreen from "../features/restaurant/screens/RestaurantDetailScreen";
import OrderCreateScreen from "../features/restaurant/screens/OrderCreateScreen";
import MyOrdersScreen from "../features/restaurant/screens/MyOrdersScreen";
import OrderDetailScreen from "../features/restaurant/screens/OrderDetailScreen";
import ReservationsScreen from "../features/restaurant/screens/ReservationsScreen";
import EventsScreen from "../features/restaurant/screens/EventsScreen";
import ReviewsScreen from "../features/restaurant/screens/ReviewsScreen";
import ProfileScreen from "../features/restaurant/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = { headerStyle: { backgroundColor: COLORS.charcoal }, headerTintColor: COLORS.gold, headerTitleStyle: { fontFamily: "serif" } };

const HomeStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Inicio" }} />
    <Stack.Screen name="EventsList" component={EventsScreen} options={{ title: "Eventos" }} />
    <Stack.Screen name="ReviewsList" component={ReviewsScreen} options={{ title: "Reseñas" }} />
  </Stack.Navigator>
);

const RestaurantsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="RestaurantsList" component={RestaurantsScreen} options={{ title: "Restaurantes" }} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: "Detalle" }} />
    <Stack.Screen name="OrderCreate" component={OrderCreateScreen} options={{ title: "Nuevo Pedido" }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: "Mis Pedidos" }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalle Pedido" }} />
  </Stack.Navigator>
);

const ReservationsStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="MyReservations" component={ReservationsScreen} options={{ title: "Reservaciones" }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Perfil" }} />
  </Stack.Navigator>
);

const RestaurantTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.gold,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: { backgroundColor: COLORS.charcoal, borderTopColor: COLORS.borderLight, height: 60, paddingBottom: 8, paddingTop: 4 },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: "home", Restaurants: "restaurant", Orders: "receipt", Reservations: "event", Profile: "person" };
        return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: "Inicio" }} />
    <Tab.Screen name="Restaurants" component={RestaurantsStack} options={{ title: "Restaurantes" }} />
    <Tab.Screen name="Orders" component={OrdersStack} options={{ title: "Pedidos" }} />
    <Tab.Screen name="Reservations" component={ReservationsStack} options={{ title: "Reservas" }} />
    <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Perfil" }} />
  </Tab.Navigator>
);

export default RestaurantTabs;