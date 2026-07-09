import React, { useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { useRestaurants } from "../hooks/useRestaurants";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
} from "../../../shared/constants/theme";
import {
    LoadingSpinner,
    EmptyState,
    Card,
} from "../../../shared/components/Common";

const RestaurantCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <Card style={styles.card}>
            {item.imageUrl ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.image, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>Sin imagen</Text>
                </View>
            )}
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    {item.averageRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.info} numberOfLines={2}>{item.description}</Text>
                <View style={styles.footer}>
                    <Text style={styles.price}>Q{item.averagePrice || 0} promedio</Text>
                    <View style={[styles.statusBadge, item.isActive ? styles.active : styles.inactive]}>
                        <Text style={styles.statusText}>{item.isActive ? "Abierto" : "Cerrado"}</Text>
                    </View>
                </View>
            </View>
        </Card>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const { restaurants, loading, error, getRestaurants } = useRestaurants();

    React.useEffect(() => {
        getRestaurants();
    }, [getRestaurants]);

    const onRefresh = useCallback(() => {
        getRestaurants();
    }, [getRestaurants]);

    if (loading && !restaurants.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            {error && !restaurants.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <RestaurantCard
                            item={item}
                            onPress={() =>
                                navigation.navigate("RestaurantDetail", { restaurant: item })
                            }
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState message="No hay restaurantes disponibles" />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        padding: SPACING.md,
    },
    cardContainer: {
        marginBottom: SPACING.md,
    },
    card: {
        padding: 0,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: 180,
    },
    placeholderImage: {
        backgroundColor: "#cbd5e1",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        color: "#64748b",
        fontWeight: "600",
    },
    details: {
        padding: SPACING.md,
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
        flex: 1,
    },
    ratingBadge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: SPACING.sm,
    },
    ratingText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        color: COLORS.surface,
    },
    category: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: "600",
        marginTop: 2,
        textTransform: "uppercase",
    },
    info: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.secondary,
        marginTop: 4,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: SPACING.md,
    },
    price: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: COLORS.primary,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    active: {
        backgroundColor: COLORS.success + "20",
    },
    inactive: {
        backgroundColor: COLORS.error + "20",
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        color: COLORS.text,
    },
});

export default HomeScreen;
