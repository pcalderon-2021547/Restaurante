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

// Migrado desde FrontedRestaurante/RestauranteClient (AuthPage + RegisterForm),
// respetando la identidad visual "obsidian & gold" del original.
// La logica (useAuth.handleRegister) no se modifica: ya funcionaba.
const RegisterScreen = ({ navigation }) => {
    const { handleRegister, loading } = useAuth();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    const onSubmit = async (data) => {
        try {
            const response = await handleRegister(data);
            if (response?.success) {
                Alert.alert(
                    "Cuenta creada",
                    "Revisa tu correo electrónico para verificar tu cuenta. Si no encuentras el correo, revisa la bandeja de spam.",
                    [{ text: "OK", onPress: () => {
                        reset();
                        navigation.navigate("Login");
                    } }]
                );
            } else {
                Alert.alert("Error", response?.message || "Error al registrarse");
            }
        } catch (error) {
            console.error(error);
            const message = extractErrorMessage(error, "Error al registrarse");
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
                <AuthHeader eyebrow="Únete al sistema" title={"Crea tu\ncuenta."} />

                <View style={styles.card}>
                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: "Requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Nombre"
                                placeholder="Tu nombre"
                                value={value}
                                onChangeText={onChange}
                                error={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="surname"
                        rules={{ required: "Requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Apellido"
                                placeholder="Tu apellido"
                                value={value}
                                onChangeText={onChange}
                                error={errors.surname?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="username"
                        rules={{
                            required: "El usuario es requerido",
                            minLength: { value: 3, message: "Mínimo 3 caracteres" },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Usuario"
                                placeholder="nombre_usuario"
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                error={errors.username?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="phone"
                        rules={{
                            required: "El teléfono es requerido",
                            pattern: {
                                value: /^\d{8}$/,
                                message: "Debe tener 8 dígitos",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Telefono"
                                placeholder="Ej: 12345678"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={onChange}
                                error={errors.phone?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "El correo es requerido",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Correo inválido",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Email"
                                placeholder="correo@ejemplo.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{
                            required: "La contraseña es requerida",
                            minLength: { value: 8, message: "Mínimo 8 caracteres" },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Contrasena"
                                placeholder="********"
                                secureTextEntry
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{
                            required: "Confirma tu contraseña",
                            validate: (value) => value === password || "Las contraseñas no coinciden",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AuthInput
                                label="Confirmar"
                                placeholder="••••••••"
                                secureTextEntry
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                error={errors.confirmPassword?.message}
                            />
                        )}
                    />

                    <AuthButton
                        title={loading ? "Creando cuenta..." : "Crear cuenta"}
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Ya tienes cuenta? </Text>
                        <AuthLinkButton
                            title="Inicia sesion"
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
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    footerText: {
        fontSize: 13,
        color: AUTH_COLORS.textMuted,
    },
});

export default RegisterScreen;
