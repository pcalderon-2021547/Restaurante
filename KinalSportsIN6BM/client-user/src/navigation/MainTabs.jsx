import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../shared/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "../features/home/screens/HomeScreen";
import RestaurantDetailScreen from "../features/home/screens/RestaurantDetailScreen";
import ReservationScreen from "../features/home/screens/ReservationScreen";
import MyReservationsScreen from "../features/home/screens/MyReservationsScreen";
import ReviewScreen from "../features/home/screens/ReviewScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeList"
      component={HomeScreen}
      options={{ title: "Restaurantes" }}
    />
    <Stack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
      options={{ title: "Detalle" }}
    />
    <Stack.Screen
      name="CreateReservation"
      component={ReservationScreen}
      options={{ title: "Reservar mesa" }}
    />
    <Stack.Screen
      name="CreateReview"
      component={ReviewScreen}
      options={{ title: "Nueva reseña" }}
    />
  </Stack.Navigator>
);

const ReservationsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MyReservationsList"
      component={MyReservationsScreen}
      options={{ title: "Mis reservaciones" }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileHome"
      component={ProfileScreen}
      options={{ title: "Perfil" }}
    />
    <Stack.Screen
      name="MyReservations"
      component={MyReservationsScreen}
      options={{ title: "Mis reservaciones" }}
    />
  </Stack.Navigator>
);

const MainTabs = () => {
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
          if (route.name === "Home") iconName = "restaurant";
          else if (route.name === "Reservations") iconName = "event-note";
          else if (route.name === "Profile") iconName = "person";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationsStack}
        options={{ title: "Reservaciones" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: "Perfil", headerShown: true }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
