import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from "react-native";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const RestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getRestaurants();
      setRestaurants(res.data?.restaurants || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? restaurants.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()))
    : restaurants;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Badge text={item.category || "General"} variant="gold" />
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.info}>📍 {item.address}</Text>
        <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || "N/A"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <TextInput
        style={styles.search}
        placeholder="Buscar restaurante..."
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No hay restaurantes disponibles" />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  search: {
    backgroundColor: COLORS.warmDark, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 14, marginBottom: 12,
  },
  list: { paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderLight,
    padding: 16, marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  name: { fontFamily: "serif", fontSize: 20, color: COLORS.text, flex: 1 },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  info: { fontSize: 12, color: COLORS.textSubtle, flex: 1 },
  rating: { fontSize: 13, color: COLORS.gold, fontWeight: "700" },
});

export default RestaurantsScreen;