import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Linking, TouchableOpacity } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card, LoadingSpinner, EmptyState } from "../../../shared/components/Common";
import { MaterialIcons } from "@expo/vector-icons";
import { useDishes } from "../hooks/useDishes";
import { useReviews } from "../hooks/useReviews";

const TABS = [
  { key: "info", label: "Info", icon: "info" },
  { key: "menu", label: "Menú", icon: "restaurant-menu" },
  { key: "reviews", label: "Reseñas", icon: "star" },
];

const DishItem = ({ dish }) => (
  <View style={styles.dishItem}>
    <View style={styles.dishHeader}>
      <Text style={styles.dishName}>{dish.name}</Text>
      <Text style={styles.dishPrice}>Q{dish.price}</Text>
    </View>
    {dish.description ? (
      <Text style={styles.dishDesc} numberOfLines={2}>{dish.description}</Text>
    ) : null}
    <View style={[styles.dishStatus, dish.isAvailable !== false ? styles.dishActive : styles.dishInactive]}>
      <Text style={styles.dishStatusText}>{dish.isAvailable !== false ? "Disponible" : "Agotado"}</Text>
    </View>
  </View>
);

const ReviewItem = ({ review }) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map(i => (
          <MaterialIcons
            key={i}
            name="star"
            size={16}
            color={i <= review.rating ? "#f59e0b" : "#e2e8f0"}
          />
        ))}
      </View>
      <Text style={styles.reviewDate}>
        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
      </Text>
    </View>
    {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
    {review.user && <Text style={styles.reviewUser}>— {review.user?.name || review.user}</Text>}
  </View>
);

const InfoSection = ({ restaurant, openMap, callPhone }) => (
  <>
    <Card style={styles.infoCard}>
      <View style={styles.infoRow}>
        <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Horario</Text>
          <Text style={styles.infoValue}>{restaurant.openingHour} - {restaurant.closingHour}</Text>
        </View>
      </View>
    </Card>

    <Card style={styles.infoCard}>
      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Dirección</Text>
          <Text style={styles.infoValue}>{restaurant.address}</Text>
        </View>
      </View>
      <Button title="Ver en mapa" variant="secondary" onPress={openMap} style={styles.actionBtn} />
    </Card>

    <Card style={styles.infoCard}>
      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={20} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Contacto</Text>
          <Text style={styles.infoValue}>{restaurant.phone}</Text>
          {restaurant.email && <Text style={styles.infoValue}>{restaurant.email}</Text>}
        </View>
      </View>
      <Button title="Llamar" variant="secondary" onPress={callPhone} style={styles.actionBtn} />
    </Card>

    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.description}>{restaurant.description}</Text>
    </Card>

    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Precio promedio</Text>
      <Text style={styles.price}>Q{restaurant.averagePrice || 0}</Text>
    </Card>

    {restaurant.totalReviews > 0 && (
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Calificación</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.bigRating}>{restaurant.averageRating?.toFixed(1) || "—"}</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map(i => (
              <MaterialIcons
                key={i}
                name="star"
                size={24}
                color={i <= Math.round(restaurant.averageRating || 0) ? "#f59e0b" : "#e2e8f0"}
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>{restaurant.totalReviews} reseñas</Text>
        </View>
      </Card>
    )}
  </>
);

const MenuSection = ({ dishes, dishesLoading, restaurantId, navigation }) => {
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    if (!dishes.length) return;
    const map = {};
    dishes.forEach(d => {
      const cat = d.category?.name || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(d);
    });
    setGrouped(map);
  }, [dishes]);

  if (dishesLoading) return <LoadingSpinner />;
  if (!dishes.length) return <EmptyState message="No hay platillos disponibles" />;

  return (
    <View>
      {Object.entries(grouped).map(([cat, items]) => (
        <View key={cat} style={styles.menuCategory}>
          <Text style={styles.menuCategoryTitle}>{cat}</Text>
          {items.map(dish => (
            <DishItem key={dish._id} dish={dish} />
          ))}
        </View>
      ))}
    </View>
  );
};

const ReviewsSection = ({ reviews, loading, restaurantId, navigation }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <View>
      {reviews.length === 0 ? (
        <EmptyState message="No hay reseñas aún. ¡Sé el primero!" />
      ) : (
        reviews.map(r => <ReviewItem key={r._id} review={r} />)
      )}
      <Button
        title="Escribir una reseña"
        onPress={() => navigation.navigate("CreateReview", { restaurantId })}
        style={styles.actionBtn}
      />
    </View>
  );
};

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const [activeTab, setActiveTab] = useState("info");
  const { dishes, loading: dishesLoading, getDishes } = useDishes();
  const { reviews, loading: reviewsLoading, getReviews } = useReviews();

  useEffect(() => {
    getDishes(restaurant._id);
    getReviews(restaurant._id);
  }, [restaurant._id]);

  const openMap = () => {
    const daddr = encodeURIComponent(restaurant.address);
    Linking.openURL(`https://maps.google.com/?daddr=${daddr}`);
  };

  const callPhone = () => {
    Linking.openURL(`tel:${restaurant.phone}`);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "info":
        return <InfoSection restaurant={restaurant} openMap={openMap} callPhone={callPhone} />;
      case "menu":
        return <MenuSection dishes={dishes} dishesLoading={dishesLoading} restaurantId={restaurant._id} navigation={navigation} />;
      case "reviews":
        return <ReviewsSection reviews={reviews} loading={reviewsLoading} restaurantId={restaurant._id} navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} bounces={false}>
        {restaurant.imageUrl ? (
          <Image source={{ uri: restaurant.imageUrl }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImage, styles.placeholder]}>
            <MaterialIcons name="restaurant" size={48} color="#64748b" />
          </View>
        )}

        <View style={styles.headerOverlay}>
          <Text style={styles.headerName}>{restaurant.name}</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerCategory}>{restaurant.category}</Text>
            {restaurant.averageRating > 0 && (
              <View style={styles.headerRating}>
                <MaterialIcons name="star" size={16} color="#fff" />
                <Text style={styles.headerRatingText}>{restaurant.averageRating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialIcons
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? COLORS.primary : COLORS.secondary}
              />
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {renderTab()}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Reservar mesa"
          onPress={() => navigation.navigate("CreateReservation", { restaurant })}
          style={styles.reserveBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  headerImage: { width: "100%", height: 220 },
  placeholder: { backgroundColor: "#cbd5e1", justifyContent: "center", alignItems: "center" },
  headerOverlay: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerName: { fontSize: FONT_SIZE.xxl, fontWeight: "800", color: COLORS.text },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.xs, gap: SPACING.sm },
  headerCategory: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: "600", textTransform: "uppercase" },
  headerRating: {
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  headerRatingText: { fontSize: FONT_SIZE.sm, fontWeight: "700", color: "#fff" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.secondary },
  tabLabelActive: { color: COLORS.primary },
  content: { padding: SPACING.lg },
  infoCard: { marginBottom: SPACING.md },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FONT_SIZE.xs, fontWeight: "600", color: COLORS.secondary, textTransform: "uppercase" },
  infoValue: { fontSize: FONT_SIZE.md, color: COLORS.text, marginTop: 2 },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.sm },
  description: { fontSize: FONT_SIZE.md, color: COLORS.secondary, lineHeight: 22 },
  price: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.primary },
  actionBtn: { marginTop: SPACING.sm },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  bigRating: { fontSize: 36, fontWeight: "800", color: COLORS.text },
  ratingStars: { flexDirection: "row", gap: 2 },
  reviewCount: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  menuCategory: { marginBottom: SPACING.lg },
  menuCategoryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + "30",
    paddingBottom: SPACING.xs,
  },
  dishItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dishHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dishName: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.text, flex: 1 },
  dishPrice: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary },
  dishDesc: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 4 },
  dishStatus: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  dishActive: { backgroundColor: COLORS.success + "20" },
  dishInactive: { backgroundColor: COLORS.error + "20" },
  dishStatusText: { fontSize: 11, fontWeight: "600", color: COLORS.text },
  reviewItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewDate: { fontSize: FONT_SIZE.xs, color: COLORS.secondary },
  reviewComment: { fontSize: FONT_SIZE.md, color: COLORS.text, marginTop: SPACING.sm, lineHeight: 20 },
  reviewUser: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: SPACING.xs, fontStyle: "italic" },
  bottomBar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reserveBtn: { marginBottom: 0 },
});

export default RestaurantDetailScreen;
