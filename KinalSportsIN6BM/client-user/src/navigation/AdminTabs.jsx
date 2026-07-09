import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { COLORS } from "../shared/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

import DashboardScreen from "../features/admin/screens/DashboardScreen";
import UsersScreen from "../features/admin/screens/UsersScreen";
import RestaurantsScreen from "../features/admin/screens/RestaurantsScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="AdminHome"
            component={DashboardScreen}
            options={{ title: "Dashboard" }}
        />
        <Stack.Screen
            name="UsersList"
            component={UsersScreen}
            options={{ title: "Usuarios" }}
        />
        <Stack.Screen
            name="RestaurantsList"
            component={RestaurantsScreen}
            options={{ title: "Restaurantes" }}
        />
    </Stack.Navigator>
);

const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
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
                    else if (route.name === "Users") iconName = "people";
                    else if (route.name === "Restaurants") iconName = "store";
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
                component={ProfileScreen}
                options={{ title: "Perfil", headerShown: true }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabs;
