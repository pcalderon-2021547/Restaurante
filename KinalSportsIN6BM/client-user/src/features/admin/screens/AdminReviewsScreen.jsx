import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const AdminReviewsScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getRestaurants();
      const restaurants = res.data?.restaurants || [];
      const allReviews = [];
      for (const r of restaurants.slice(0, 5)) {
        try {
          const revRes = await restaurantService.getRestaurantReviews(r._id);
          const rv = revRes.data?.reviews || [];
          rv.forEach((v) => { v.restaurantName = r.name; });
          allReviews.push(...rv);
        } catch {}
      }
      setReviews(allReviews);
    } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <FlatList
        data={reviews}
        keyExtractor={(item, i) => item._id || String(i)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={styles.restName}>{item.restaurantName || "Restaurante"}</Text>
              <Text style={styles.rating}>{item.rating}/5 ★</Text>
            </View>
            <Text style={styles.user}>Usuario: {item.user}</Text>
            {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay reseñas disponibles" />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  restName: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  rating: { fontSize: 14, color: COLORS.gold, fontWeight: "700" },
  user: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  comment: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});

export default AdminReviewsScreen;