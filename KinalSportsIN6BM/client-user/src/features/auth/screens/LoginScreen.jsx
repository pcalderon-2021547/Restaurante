import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";

import { useForm, Controller } from "react-hook-form";
import { AUTH_COLORS } from "../../../shared/constants/theme";
import AuthInput from "../../../shared/components/auth/AuthInput";
import AuthButton, { AuthLinkButton } from "../../../shared/components/auth/AuthButton";
import AuthHeader from "../../../shared/components/auth/AuthHeader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../../../shared/utils/extractErrorMessage";

// Migrado desde FrontedRestaurante/RestauranteClient (AuthPage + LoginForm).
// Se conserva la identidad visual "obsidian & gold" del login original,
// adaptando <div>/<input>/<button> a <View>/<TextInput>/<TouchableOpacity>.
// La logica (useAuth -> authClient -> auth-service .NET) ya existia en la
// app movil y funciona correctamente, por lo que no se modifica aqui.
const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            emailOrUsername: "",
            password: "",
            emailToken: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleLogin(data);
        } catch (error) {
            console.error(error);
            const message = extractErrorMessage(error, "Error al iniciar sesion");
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
                    eyebrow="Sistema de administración"
                    title={"Bienvenido\nde nuevo."}
                />

                <View style={styles.card}>
                    <Controller
                        control={control}
                        name="emailOrUsername"
                        rules={{
                            required: "El correo o usuario es requerido",
                            validate: (value) =>
                                value?.trim().length > 0 || "Ingresa tu correo o usuario",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Correo o usuario"
                                placeholder="correo@ejemplo.com o usuario"
                                autoCapitalize="none"
                                autoComplete="username"
                                value={value}
                                onChangeText={onChange}
                                error={errors.emailOrUsername?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{ required: "La contrasena es obligatoria" }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Contrasena"
                                placeholder="********"
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="current-password"
                                value={value}
                                onChangeText={onChange}
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="emailToken"
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Token de verificación (opcional)"
                                placeholder="Pega el token de tu correo"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />

                    <AuthButton
                        title={loading ? "Verificando..." : "Iniciar sesion"}
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <View style={styles.linksRow}>
                        <AuthLinkButton
                            title="Olvidaste tu contrasena?"
                            onPress={() => navigation.navigate("ForgotPassword")}
                        />
                        <AuthLinkButton
                            title="Crear cuenta"
                            onPress={() => navigation.navigate("Register")}
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
    linksRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        flexWrap: "wrap",
        gap: 10,
    },
});

export default LoginScreen;
