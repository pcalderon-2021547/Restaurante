import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, FONT_SIZE, SPACING } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const TAB_ITEMS = ["Menú", "Eventos", "Reseñas"];

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const [activeTab, setActiveTab] = useState(0);
  const [dishes, setDishes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dishesRes, menusRes, eventsRes, reviewsRes] = await Promise.all([
          restaurantService.getDishes().catch(() => ({ data: { dishes: [] } })),
          restaurantService.getMenus().catch(() => ({ data: { menus: [] } })),
          restaurantService.getEventsByRestaurant(restaurant._id).catch(() => ({ data: { events: [] } })),
          restaurantService.getRestaurantReviews(restaurant._id).catch(() => ({ data: { reviews: [] } })),
        ]);
        const restDishes = dishesRes.data?.dishes?.filter((d) => String(d.restaurant?._id || d.restaurant) === restaurant._id) || [];
        setDishes(restDishes);
        const restMenus = menusRes.data?.menus?.filter((m) => String(m.restaurant?._id || m.restaurant) === restaurant._id) || [];
        setMenus(restMenus);
        setEvents(eventsRes.data?.events || []);
        setReviews(reviewsRes.data?.reviews || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurant._id]);

  const addToCart = (dish) => {
    navigation.navigate("OrderCreate", { restaurant, dish });
  };

  return (
    <ScreenWrapper scroll>
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.category}>{restaurant.category}</Text>
      </View>
      <Text style={styles.address}>📍 {restaurant.address}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📞 {restaurant.phone}</Text>
        <Text style={styles.infoText}>★ {restaurant.averageRating?.toFixed(1) || "N/A"}</Text>
        <Text style={styles.infoText}>💰 Q{restaurant.averagePrice || 0} prom.</Text>
      </View>
      <Text style={styles.hours}>🕐 {restaurant.openingHour} - {restaurant.closingHour}</Text>

      <View style={styles.tabs}>
        {TAB_ITEMS.map((tab, i) => (
          <TouchableOpacity key={i} style={[styles.tab, activeTab === i && styles.activeTab]} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingSpinner /> : (
        <>
          {activeTab === 0 && (
            <>
              {menus.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Menús</Text>
                  {menus.map((menu) => (
                    <TouchableOpacity key={menu._id} onPress={() => setSelectedMenu(selectedMenu === menu._id ? null : menu._id)}>
                      <Card style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={styles.menuName}>{menu.name}</Text>
                          <Text style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase" }}>{menu.type || "DAILY"}</Text>
                        </View>
                        {menu.description ? <Text style={styles.dishDesc}>{menu.description}</Text> : null}
                        {selectedMenu === menu._id && menu.dishes?.length > 0 && (
                          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 }}>
                            {menu.dishes.map((d) => {
                              const fullDish = dishes.find((dd) => dd._id === (d._id || d));
                              if (!fullDish) return null;
                              return (
                                <View key={fullDish._id} style={[styles.dishRow, { marginBottom: 6 }]}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.dishName}>{fullDish.name}</Text>
                                  </View>
                                  <View style={styles.dishRight}>
                                    <Text style={styles.dishPrice}>Q{fullDish.price?.toFixed(2)}</Text>
                                    <GoldButton title="Agregar" onPress={() => addToCart(fullDish)} small />
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </Card>
                    </TouchableOpacity>
                  ))}
                </>
              )}
              <Text style={[styles.sectionTitle, menus.length > 0 && { marginTop: 16 }]}>Platos</Text>
              {dishes.map((dish) => (
                <Card key={dish._id} style={styles.dishCard}>
                  <View style={styles.dishRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dishName}>{dish.name}</Text>
                      {dish.description ? <Text style={styles.dishDesc}>{dish.description}</Text> : null}
                    </View>
                    <View style={styles.dishRight}>
                      <Text style={styles.dishPrice}>Q{dish.price?.toFixed(2)}</Text>
                      <GoldButton title="Agregar" onPress={() => addToCart(dish)} small />
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {activeTab === 1 && events.map((ev) => (
            <Card key={ev._id} style={{ marginBottom: 8 }}>
              <Text style={[styles.dishName, { fontFamily: "serif" }]}>{ev.name}</Text>
              <Text style={styles.dishDesc}>{ev.description}</Text>
              <Text style={styles.infoText}>📅 {new Date(ev.date).toLocaleDateString()}</Text>
              <Badge text={ev.status} variant={ev.status === "active" ? "success" : "warning"} />
            </Card>
          ))}

          {activeTab === 2 && reviews.map((rev) => (
            <Card key={rev._id} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.dishName}>Usuario {rev.user}</Text>
                <Text style={{ color: COLORS.gold, fontWeight: "700" }}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</Text>
              </View>
              {rev.comment ? <Text style={styles.dishDesc}>{rev.comment}</Text> : null}
            </Card>
          ))}
        </>
      )}

      <GoldButton
        title="Hacer Pedido"
        onPress={() => navigation.navigate("OrderCreate", { restaurant })}
        style={{ marginTop: 16, marginBottom: 32 }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  name: { fontFamily: "serif", fontSize: 26, color: COLORS.text, flex: 1 },
  category: {},
  sectionTitle: { fontSize: 14, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  menuName: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  address: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  infoRow: { flexDirection: "row", gap: 16, marginBottom: 4 },
  infoText: { fontSize: 12, color: COLORS.textSubtle },
  hours: { fontSize: 12, color: COLORS.textSubtle, marginBottom: 20 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 16 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: COLORS.gold },
  tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
  activeTabText: { color: COLORS.gold },
  dishCard: { marginBottom: 8 },
  dishRow: { flexDirection: "row", alignItems: "center" },
  dishName: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  dishDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  dishRight: { alignItems: "flex-end", marginLeft: 12 },
  dishPrice: { fontSize: 16, color: COLORS.gold, fontWeight: "700", marginBottom: 4 },
});

export default RestaurantDetailScreen;