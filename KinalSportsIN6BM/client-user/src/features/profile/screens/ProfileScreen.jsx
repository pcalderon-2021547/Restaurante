import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
} from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Common";
import { useAuthStore } from "../../../shared/store/authStore";
import { useProfile } from "../../home/hooks/useProfile";
import { LoadingSpinner } from "../../../shared/components/Common";
import avatarDefault from "../../../../assets/avatarDefault.png";

const ProfileScreen = () => {
    const { user, logout } = useAuthStore();
    const { profile, loading, error, getProfile } = useProfile();

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas salir?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Aceptar", onPress: () => logout() },
        ]);
    };

    const p = profile || user;

    if (loading && !p) return <LoadingSpinner />;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={p?.avatar ? { uri: p.avatar } : avatarDefault}
                    style={styles.avatarImage}
                />
                <Text style={styles.userName}>
                    {p?.name || ""} {p?.surname || ""}
                </Text>
                <Text style={styles.userHandle}>@{p?.username || ""}</Text>
                <Text style={styles.userEmail}>{p?.email || ""}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {p?.role === "ADMIN_ROLE"
                            ? "Administrador"
                            : p?.role === "ADMIN_RESTAURANT_ROLE"
                                ? "Admin. Restaurante"
                                : "Usuario"}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <Card style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>Información</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Nombres</Text>
                        <Text style={styles.value}>{p?.name || "—"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Apellidos</Text>
                        <Text style={styles.value}>{p?.surname || "—"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Usuario</Text>
                        <Text style={styles.value}>{p?.username || "—"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{p?.email || "—"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Verificado</Text>
                        <Text style={[styles.value, p?.emailVerified ? styles.verified : styles.notVerified]}>
                            {p?.emailVerified ? "Sí" : "No"}
                        </Text>
                    </View>
                </Card>

                <View style={styles.actions}>
                    <Button
                        title="Cerrar Sesión"
                        variant="secondary"
                        onPress={handleLogout}
                    />
                </View>

                <Text style={styles.version}>KinalSports v1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingVertical: SPACING.xxl,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.white,
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    userName: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "700",
        color: COLORS.text,
    },
    userHandle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.secondary,
        marginTop: 2,
    },
    userEmail: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.secondary,
        marginTop: 2,
    },
    roleBadge: {
        marginTop: SPACING.sm,
        backgroundColor: COLORS.primary + "15",
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        color: COLORS.primary,
    },
    content: {
        padding: SPACING.lg,
    },
    profileCard: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    label: {
        fontSize: FONT_SIZE.md,
        color: COLORS.secondary,
    },
    value: {
        fontSize: FONT_SIZE.md,
        fontWeight: "600",
        color: COLORS.text,
    },
    verified: {
        color: COLORS.success,
    },
    notVerified: {
        color: COLORS.warning,
    },
    actions: {
        marginTop: SPACING.sm,
    },
    version: {
        textAlign: "center",
        marginTop: SPACING.xxl,
        color: COLORS.textLight,
        paddingBottom: SPACING.xl,
        fontSize: FONT_SIZE.xs,
    },
});

export default ProfileScreen;
