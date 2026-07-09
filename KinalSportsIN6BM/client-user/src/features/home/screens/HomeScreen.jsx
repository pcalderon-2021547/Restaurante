import React, { useCallback, useState, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    RefreshControl,
    TextInput,
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
import { MaterialIcons } from "@expo/vector-icons";

const RestaurantCard = ({ item, onPress, isFeatured }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <Card style={[styles.card, isFeatured && styles.featuredCard]}>
            {item.imageUrl ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={[styles.image, isFeatured && styles.featuredImage]}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.image, styles.placeholderImage, isFeatured && styles.featuredImage]}>
                    <MaterialIcons name={isFeatured ? "local-fire-department" : "restaurant"} size={isFeatured ? 48 : 32} color="#64748b" />
                </View>
            )}
            {isFeatured && (
                <View style={styles.featuredBadge}>
                    <MaterialIcons name="star" size={14} color="#fff" />
                    <Text style={styles.featuredBadgeText}>Destacado</Text>
                </View>
            )}
            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={[styles.name, isFeatured && styles.featuredName]} numberOfLines={1}>{item.name}</Text>
                    {item.averageRating > 0 && (
                        <View style={styles.ratingBadge}>
                            <MaterialIcons name="star" size={14} color="#fff" />
                            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.info} numberOfLines={isFeatured ? 3 : 2}>{item.description}</Text>
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
    const [search, setSearch] = useState("");

    React.useEffect(() => {
        getRestaurants();
    }, [getRestaurants]);

    const onRefresh = useCallback(() => {
        getRestaurants();
    }, [getRestaurants]);

    const featured = useMemo(() =>
        restaurants.find(r => r.name === "Leña y Fuego"),
        [restaurants]
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return restaurants;
        const q = search.toLowerCase();
        return restaurants.filter(r =>
            r.name.toLowerCase().includes(q) ||
            (r.category && r.category.toLowerCase().includes(q)) ||
            (r.description && r.description.toLowerCase().includes(q))
        );
    }, [restaurants, search]);

    const data = useMemo(() => {
        if (featured && !search.trim()) {
            return filtered.filter(r => r._id !== featured._id);
        }
        return filtered;
    }, [filtered, featured, search]);

    if (loading && !restaurants.length) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            {error && !restaurants.length ? (
                <EmptyState message={error} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={
                        <>
                            <View style={styles.searchContainer}>
                                <MaterialIcons name="search" size={20} color={COLORS.secondary} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar restaurantes..."
                                    placeholderTextColor={COLORS.textLight}
                                    value={search}
                                    onChangeText={setSearch}
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch("")}>
                                        <MaterialIcons name="close" size={20} color={COLORS.secondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {featured && !search.trim() && (
                                <View style={styles.featuredSection}>
                                    <Text style={styles.sectionTitle}>🌟 Destacado</Text>
                                    <RestaurantCard
                                        item={featured}
                                        isFeatured
                                        onPress={() =>
                                            navigation.navigate("RestaurantDetail", { restaurant: featured })
                                        }
                                    />
                                    <Text style={styles.sectionTitle}>🍽️ Todos los restaurantes</Text>
                                </View>
                            )}
                        </>
                    }
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
                        <EmptyState message={search ? "Sin resultados" : "No hay restaurantes disponibles"} />
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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: SPACING.sm,
        marginTop: SPACING.xs,
    },
    featuredSection: {
        marginBottom: SPACING.sm,
    },
    cardContainer: {
        marginBottom: SPACING.md,
    },
    card: {
        padding: 0,
        overflow: "hidden",
    },
    featuredCard: {
        borderWidth: 2,
        borderColor: "#C62828",
    },
    image: {
        width: "100%",
        height: 180,
    },
    featuredImage: {
        height: 220,
    },
    placeholderImage: {
        backgroundColor: "#cbd5e1",
        justifyContent: "center",
        alignItems: "center",
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
    featuredName: {
        fontSize: FONT_SIZE.xl,
        color: "#C62828",
    },
    ratingBadge: {
        backgroundColor: "#f59e0b",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: SPACING.sm,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        color: COLORS.surface,
    },
    featuredBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "#C62828",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    featuredBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#fff",
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
