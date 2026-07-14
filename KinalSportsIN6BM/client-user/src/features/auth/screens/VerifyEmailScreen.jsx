import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { ENDPOINTS } from "../../../shared/constants/endpoints";
import { AUTH_COLORS } from "../../../shared/constants/theme";
import AuthButton from "../../../shared/components/auth/AuthButton";

const VerifyEmailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Verificando tu correo...");

    useEffect(() => {
        const verify = async () => {
            try {
                const token = route.params?.token;
                if (!token) {
                    setMessage("No se recibió un token de verificación.");
                    setLoading(false);
                    return;
                }

                const response = await axios.post(`${ENDPOINTS.AUTH}/verify-email`, { token });
                setMessage(response.data?.message || "Tu correo fue verificado correctamente.");
            } catch (error) {
                setMessage(error.response?.data?.message || "No se pudo verificar tu correo.");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [route.params?.token]);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {loading ? (
                    <ActivityIndicator size="large" color={AUTH_COLORS.gold} />
                ) : null}
                <Text style={styles.title}>Verificación de correo</Text>
                <Text style={styles.message}>{message}</Text>
                <AuthButton
                    title="Volver al login"
                    onPress={() => navigation.navigate("Login")}
                    style={styles.button}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AUTH_COLORS.obsidian,
        justifyContent: "center",
        padding: 24,
    },
    card: {
        backgroundColor: AUTH_COLORS.charcoal,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: AUTH_COLORS.border,
        padding: 24,
        alignItems: "center",
    },
    title: {
        color: AUTH_COLORS.cream,
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },
    message: {
        color: AUTH_COLORS.textMuted,
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        width: "100%",
    },
});

export default VerifyEmailScreen;
