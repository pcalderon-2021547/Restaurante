import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { AUTH_COLORS } from "../../../shared/constants/theme";
import AuthInput from "../../../shared/components/auth/AuthInput";
import AuthButton, { AuthLinkButton } from "../../../shared/components/auth/AuthButton";
import AuthHeader from "../../../shared/components/auth/AuthHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../../../shared/utils/extractErrorMessage";

// Migrado desde FrontedRestaurante/RestauranteClient (ForgotPasswordForm).
// No existia una pantalla equivalente en la app movil; se agrega para
// mantener paridad completa con el flujo de login web (auth-service ya
// expone POST /forgot-password, ver AuthController.cs).
const ForgotPasswordScreen = ({ navigation }) => {
    const { handleForgotPassword, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({ defaultValues: { email: "" } });

    const onSubmit = async ({ email }) => {
        try {
            const response = await handleForgotPassword(email);
            if (response?.success) {
                Alert.alert(
                    "Correo de recuperación enviado",
                    "Revisa tu bandeja para continuar.",
                    [{ text: "OK", onPress: () => {
                        reset();
                        navigation.navigate("Login");
                    } }]
                );
            } else {
                Alert.alert("Error", response?.message || "Error al enviar correo");
            }
        } catch (error) {
            const message = extractErrorMessage(error, "Error al enviar el correo");
            Alert.alert("Error", message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <AuthHeader
                    eyebrow="Recuperación de acceso"
                    title={"Restablecer\ncontraseña."}
                />

                <View style={styles.card}>
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "El correo es obligatorio",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Ingresa un correo válido",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Correo electronico"
                                placeholder="correo@ejemplo.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <AuthButton
                        title={loading ? "Enviando..." : "Enviar correo de recuperacion"}
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <View style={styles.footer}>
                        <AuthLinkButton
                            title="Volver al inicio de sesion"
                            onPress={() => navigation.navigate("Login")}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AUTH_COLORS.obsidian,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingVertical: 48,
    },
    card: {
        width: "100%",
        backgroundColor: AUTH_COLORS.charcoal,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: AUTH_COLORS.border,
        padding: 22,
    },
    submitButton: {
        marginTop: 8,
    },
    footer: {
        alignItems: "center",
        marginTop: 20,
    },
});

export default ForgotPasswordScreen;
