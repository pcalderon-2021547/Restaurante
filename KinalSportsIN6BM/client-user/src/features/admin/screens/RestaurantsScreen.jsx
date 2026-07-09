import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRestaurants } from "../../home/hooks/useRestaurants";
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

const RestaurantItem = ({ item }) => (
  <Card style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
    </View>
    <Text style={styles.info}>{item.address}</Text>
    <Text style={styles.info}>{item.phone}</Text>
    <View style={styles.footer}>
      <Text style={styles.price}>Q{item.averagePrice || 0}</Text>
      <View style={[styles.statusBadge, item.isActive ? styles.active : styles.inactive]}>
        <Text style={styles.statusText}>{item.isActive ? "Activo" : "Inactivo"}</Text>
      </View>
    </View>
  </Card>
);

const RestaurantsScreen = () => {
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
          renderItem={({ item }) => <RestaurantItem item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState message="No hay restaurantes" />}
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
  card: {
    marginBottom: SPACING.sm,
  },
  header: {
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
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  info: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
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

export default RestaurantsScreen;
