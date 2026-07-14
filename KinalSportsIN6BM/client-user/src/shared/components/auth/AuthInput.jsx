import { useState } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { AUTH_COLORS, AUTH_FONTS } from "../../constants/theme";

/**
 * Input estilizado para el modulo de autenticacion (Login/Register/Forgot).
 * Replica la identidad visual del `.auth-input` / `.auth-label` de
 * FrontedRestaurante (web) usando componentes nativos de React Native.
 */
const AuthInput = ({ label, error, ...props }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.group}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    focused && styles.inputFocused,
                    error && styles.inputError,
                ]}
                placeholderTextColor={AUTH_COLORS.placeholder}
                onFocus={(e) => {
                    setFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    props.onBlur?.(e);
                }}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    group: {
        marginBottom: 18,
        width: "100%",
    },
    label: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: AUTH_COLORS.textMuted,
        marginBottom: 8,
    },
    input: {
        width: "100%",
        backgroundColor: AUTH_COLORS.panel,
        borderWidth: 1,
        borderColor: AUTH_COLORS.border,
        borderRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: AUTH_COLORS.cream,
        fontSize: 15,
        fontWeight: "300",
    },
    inputFocused: {
        borderColor: AUTH_COLORS.borderFocus,
    },
    inputError: {
        borderColor: AUTH_COLORS.error,
    },
    error: {
        fontSize: 12,
        color: AUTH_COLORS.error,
        marginTop: 6,
        letterSpacing: 0.2,
    },
});

export default AuthInput;
