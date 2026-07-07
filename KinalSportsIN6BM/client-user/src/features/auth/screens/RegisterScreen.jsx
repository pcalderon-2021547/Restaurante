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
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            password: "",
            phone: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleRegister(data);

            Alert.alert(
                "Registro exitoso",
                "Tu cuenta ha sido creada. Ahora puedes iniciar sesion",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }]
            );
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
                <AuthHeader eyebrow="Unete al sistema" title={"Crea tu\ncuenta."} />

                <View style={styles.card}>
                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: "Nombre requerido" }}
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
                        rules={{ required: "Apellido requerido" }}
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
                        rules={{ required: "Usuario requerido" }}
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
                            required: "Telefono requerido",
                            pattern: {
                                value: /^\d{8}$/,
                                message: "Debe tener exactamente 8 digitos",
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
                            required: "Email requerido",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email invalido",
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
                            required: "Contrasena requerida",
                            minLength: { value: 8, message: "Minimo 8 caracteres" },
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

                    <AuthButton
                        title={loading ? "Creando cuenta..." : "Registrarse"}
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
