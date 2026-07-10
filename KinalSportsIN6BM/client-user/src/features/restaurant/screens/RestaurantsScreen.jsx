import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Animated, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Badge from "../../../shared/components/ui/Badge";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const CATEGORIES = ["Todas", "Tradicional", "Italiana", "Mexicana", "China", "Japonesa", "Mariscos", "Parrilla", "Cafetería", "Rápida"];

const RestaurantCard = ({ item, index, onPress, onMenu, onOrders }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, delay: 60 * index, friction: 7, tension: 40, useNativeDriver: true }).start();
  }, []);

  const isActive = item.isActive !== false;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
        <LinearGradient
          colors={isActive ? [COLORS.surface, COLORS.warmDark] : [COLORS.warmDark, COLORS.obsidian]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, !isActive && { opacity: 0.7 }]}
        >
          <View style={styles.cardTop}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cardImg} />
            ) : (
              <LinearGradient
                colors={["rgba(201,168,76,0.12)", "rgba(201,168,76,0.04)"]}
                style={styles.cardImgPlaceholder}
              >
                <Ionicons name="storefront-outline" size={26} color={COLORS.gold} />
              </LinearGradient>
            )}
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: isActive ? COLORS.success : COLORS.error }]} />
              </View>
              <View style={styles.cardTags}>
                <Badge text={item.category || "General"} variant="gold" />
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color={COLORS.gold} />
                  <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || "—"}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="cash-outline" size={11} color={COLORS.textMuted} />
                  <Text style={styles.ratingText}>Q{item.averagePrice || "—"}</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
              </View>
            </View>
          </View>

          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onMenu} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: "rgba(52,211,153,0.1)" }]}>
                <Ionicons name="restaurant-outline" size={16} color={COLORS.success} />
              </View>
              <Text style={styles.actionLabel}>Ver Menú</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onOrders} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: "rgba(126,184,247,0.1)" }]}>
                <Ionicons name="receipt-outline" size={16} color={COLORS.info} />
              </View>
              <Text style={styles.actionLabel}>Mis Pedidos</Text>
            </TouchableOpacity>
            <View style={[styles.hoursBadge]}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.hoursText}>{item.openingHour}-{item.closingHour}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryChip = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.catChip, isActive && styles.catChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const RestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Todas");

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

  const filtered = restaurants.filter((r) => {
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "Todas" || r.category === activeCat;
    return matchSearch && matchCat;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Restaurantes</Text>
          <Text style={styles.headerSub}>{restaurants.length} disponibles</Text>
        </View>
        <View style={styles.headerIconBg}>
          <Ionicons name="storefront-outline" size={22} color={COLORS.gold} />
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, categoría..."
          placeholderTextColor={COLORS.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <CategoryChip label={item} isActive={activeCat === item} onPress={() => setActiveCat(item)} />
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item, index }) => (
          <RestaurantCard
            item={item}
            index={index}
            onPress={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
            onMenu={() => navigation.navigate("RestaurantDetail", { restaurant: item })}
            onOrders={() => navigation.navigate("Orders", { screen: "MyOrders" })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name={search || activeCat !== "Todas" ? "search-outline" : "storefront-outline"} size={38} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {search || activeCat !== "Todas" ? "Sin resultados" : "No hay restaurantes"}
            </Text>
            <Text style={styles.emptySub}>
              {search || activeCat !== "Todas" ? "Prueba con otros filtros" : "Pronto habrá restaurantes disponibles"}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerTitle: { fontFamily: "serif", fontSize: 26, color: COLORS.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  headerIconBg: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: "rgba(201,168,76,0.08)", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(201,168,76,0.15)",
  },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.warmDark, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.borderLight, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, padding: 0 },

  catList: { gap: 8, paddingVertical: 10 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8,
  },
  catChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  catChipText: { fontSize: 12, color: COLORS.textMuted },
  catChipTextActive: { color: COLORS.gold },

  list: { paddingBottom: 24, paddingTop: 4 },

  card: {
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden",
    ...SHADOWS.sm,
  },
  cardTop: { flexDirection: "row", gap: 12 },
  cardImg: { width: 64, height: 64, borderRadius: 14 },
  cardImgPlaceholder: { width: 64, height: 64, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { fontSize: 17, color: COLORS.text, fontWeight: "700", flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardTags: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  ratingBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  ratingText: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  cardAddress: { fontSize: 11, color: COLORS.textMuted, flex: 1 },

  cardDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight },

  cardActions: { flexDirection: "row", gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight, alignItems: "center" },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: COLORS.borderLight,
  },
  actionIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  hoursBadge: {
    flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  hoursText: { fontSize: 10, color: COLORS.textMuted },

  empty: { alignItems: "center", paddingTop: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(201,168,76,0.06)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 16, color: COLORS.text, fontWeight: "600", marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.textMuted },
});

export default RestaurantsScreen;