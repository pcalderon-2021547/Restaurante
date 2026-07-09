import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Linking } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Common";

const RestaurantDetailScreen = ({ route }) => {
    const { restaurant } = route.params;

    const openMap = () => {
        const daddr = encodeURIComponent(restaurant.address);
        Linking.openURL(`https://maps.google.com/?daddr=${daddr}`);
    };

    const callPhone = () => {
        Linking.openURL(`tel:${restaurant.phone}`);
    };

    return (
        <ScrollView style={styles.container}>
            {restaurant.imageUrl ? (
                <Image source={{ uri: restaurant.imageUrl }} style={styles.headerImage} />
            ) : (
                <View style={[styles.headerImage, styles.placeholder]}>
                    <Text style={styles.placeholderText}>Imagen no disponible</Text>
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name}>{restaurant.name}</Text>
                    {restaurant.averageRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{restaurant.averageRating.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.category}>{restaurant.category}</Text>

                <Card style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Horario</Text>
                    <Text style={styles.description}>
                        {restaurant.openingHour} - {restaurant.closingHour}
                    </Text>
                </Card>

                <Card style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Dirección</Text>
                    <Text style={styles.description}>{restaurant.address}</Text>
                    <Button
                        title="Ver en mapa"
                        variant="secondary"
                        onPress={openMap}
                        style={styles.actionBtn}
                    />
                </Card>

                <Card style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Contacto</Text>
                    <Text style={styles.description}>{restaurant.phone}</Text>
                    {restaurant.email && (
                        <Text style={styles.description}>{restaurant.email}</Text>
                    )}
                    <Button
                        title="Llamar"
                        variant="secondary"
                        onPress={callPhone}
                        style={styles.actionBtn}
                    />
                </Card>

                <Card style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.description}>{restaurant.description}</Text>
                </Card>

                <Card style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Precio promedio</Text>
                    <Text style={styles.price}>Q{restaurant.averagePrice || 0}</Text>
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerImage: {
        width: "100%",
        height: 250,
    },
    placeholder: {
        backgroundColor: "#cbd5e1",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        color: "#64748b",
        fontWeight: "700",
    },
    content: {
        padding: SPACING.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.xs,
    },
    name: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: "800",
        color: COLORS.text,
        flex: 1,
    },
    ratingBadge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: SPACING.sm,
    },
    ratingText: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: COLORS.surface,
    },
    category: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: "600",
        textTransform: "uppercase",
        marginBottom: SPACING.md,
    },
    infoCard: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONT_SIZE.md,
        color: COLORS.secondary,
        lineHeight: 22,
    },
    price: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "700",
        color: COLORS.primary,
    },
    actionBtn: {
        marginTop: SPACING.sm,
    },
});

export default RestaurantDetailScreen;
