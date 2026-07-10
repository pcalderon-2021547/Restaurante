import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AUTH_COLORS } from "../../constants/theme";

/**
 * Boton principal dorado (gradient) del modulo de autenticacion.
 * Equivalente RN del `.auth-btn` de la web (gradiente
 * #c9a84c -> #e8c96e -> #c9a84c).
 */
const AuthButton = ({ title, onPress, loading, disabled, style }) => (
    <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.wrapper, (disabled || loading) && styles.disabled, style]}
    >
        <LinearGradient
            colors={[AUTH_COLORS.gold, AUTH_COLORS.goldLight, AUTH_COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            {loading ? (
                <ActivityIndicator color={AUTH_COLORS.obsidian} />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </LinearGradient>
    </TouchableOpacity>
);

/** Boton de texto secundario (links: "Olvidaste tu contrasena?", "Crear cuenta") */
export const AuthLinkButton = ({ title, onPress, style }) => (
    <Text style={[styles.link, style]} onPress={onPress}>
        {title}
    </Text>
);

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        borderRadius: 3,
        marginTop: 6,
        overflow: "hidden",
    },
    disabled: {
        opacity: 0.5,
    },
    gradient: {
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: AUTH_COLORS.obsidian,
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 2.4,
        textTransform: "uppercase",
    },
    link: {
        color: AUTH_COLORS.gold,
        fontSize: 13,
        textDecorationLine: "underline",
    },
});

export default AuthButton;
