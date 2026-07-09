import React, { useEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Switch } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import { useRestaurants } from "../../home/hooks/useRestaurants";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const RestaurantItem = ({ item, onToggle }) => (
  <Card style={styles.restaurantCard}>
    <View style={styles.cardHeader}>
      <View style={[styles.avatar, { backgroundColor: item.isActive ? COLORS.success + "20" : COLORS.error + "20" }]}>
        <MaterialIcons name="restaurant" size={24} color={item.isActive ? COLORS.success : COLORS.error} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.category}>{item.category || "Sin categoría"}</Text>
        <Text style={styles.detail}>{item.address}</Text>
        <Text style={styles.detail}>{item.phone}</Text>
        <Text style={styles.price}>Q{item.averagePrice || 0} promedio</Text>
      </View>
      <View style={styles.statusSection}>
        <Text style={[styles.statusLabel, { color: item.isActive ? COLORS.success : COLORS.error }]}>
          {item.isActive ? "Activo" : "Inactivo"}
        </Text>
        <Switch
          value={item.isActive}
          onValueChange={() => onToggle(item._id, item.isActive)}
          trackColor={{ false: COLORS.border, true: COLORS.success + "60" }}
          thumbColor={item.isActive ? COLORS.success : COLORS.textLight}
        />
      </View>
    </View>
    {item.averageRating > 0 && (
      <View style={styles.ratingRow}>
        <MaterialIcons name="star" size={16} color="#f59e0b" />
        <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
        <Text style={styles.reviewCount}>({item.totalReviews || 0} reseñas)</Text>
      </View>
    )}
  </Card>
);

const RestaurantsScreen = () => {
  const { restaurants, loading, error, getRestaurants } = useRestaurants();
  const [local, setLocal] = useState([]);

  useEffect(() => {
    if (restaurants.length) setLocal(restaurants);
  }, [restaurants]);

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  const onRefresh = useCallback(() => {
    getRestaurants();
  }, [getRestaurants]);

  const handleToggle = async (id, current) => {
    setLocal(prev => prev.map(r => r._id === id ? { ...r, isActive: !current } : r));
    try {
      await userClient.put(`/restaurant/update/${id}`, { isActive: !current });
    } catch {
      setLocal(prev => prev.map(r => r._id === id ? { ...r, isActive: current } : r));
    }
  };

  if (loading && !local.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={local}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <RestaurantItem item={item} onToggle={handleToggle} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="No hay restaurantes" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  error: { color: COLORS.error, padding: SPACING.md, textAlign: "center" },
  restaurantCard: {},
  cardHeader: { flexDirection: "row", gap: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardInfo: { flex: 1 },
  restaurantName: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text },
  category: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: "600", textTransform: "uppercase", marginTop: 2 },
  detail: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  price: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary, marginTop: 4 },
  statusSection: { alignItems: "center", gap: 4 },
  statusLabel: { fontSize: 11, fontWeight: "600" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  ratingText: { fontSize: FONT_SIZE.sm, fontWeight: "700", color: COLORS.text },
  reviewCount: { fontSize: FONT_SIZE.xs, color: COLORS.secondary },
});

export default RestaurantsScreen;
