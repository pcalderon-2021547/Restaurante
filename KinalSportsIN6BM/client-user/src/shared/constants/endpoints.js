import { Platform } from "react-native";

const ANDROID_EMULATOR_HOST = "10.0.2.2";
const HOST = Platform.OS === "android" ? ANDROID_EMULATOR_HOST : "localhost";

export const ENDPOINTS = {
    AUTH: process.env.EXPO_PUBLIC_AUTH_URL || `http://${HOST}:3010/restaurantManagement/v1/auth`,
    USER: process.env.EXPO_PUBLIC_USER_URL || `http://${HOST}:3010/restaurantManagement/v1`
};
