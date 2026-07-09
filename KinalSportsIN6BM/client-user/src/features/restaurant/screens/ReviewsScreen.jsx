import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import GoldButton from "../../../shared/components/ui/GoldButton";
import GoldInput from "../../../shared/components/ui/GoldInput";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const ReviewsScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const restRes = await restaurantService.getRestaurants();
      const list = restRes.data?.restaurants || [];
      setRestaurants(list);
      if (list.length > 0 && !selectedRest) {
        setSelectedRest(list[0]._id);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const loadReviews = useCallback(async (restId) => {
    if (!restId) return;
    try {
      setLoadingReviews(true);
      const res = await restaurantService.getReviewsByRestaurant(restId);
      setReviews(res.data?.reviews || []);
    } catch {} finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  useEffect(() => {
    if (selectedRest) loadReviews(selectedRest);
  }, [selectedRest, loadReviews]);

  const handleCreate = async () => {
    if (!selectedRest) return Alert.alert("Error", "Selecciona un restaurante");
    try {
      setSaving(true);
      await restaurantService.createReview({ restaurant: selectedRest, rating, comment });
      Alert.alert("Éxito", "Reseña creada");
      setModalVisible(false);
      setRating(5);
      setComment("");
      loadReviews(selectedRest);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al crear reseña");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <Text style={styles.sectionLabel}>RESTAURANTE</Text>
      <FlatList
        horizontal data={restaurants} keyExtractor={(r) => r._id} showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginBottom: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.restChip, selectedRest === item._id && styles.restChipActive]}
            onPress={() => setSelectedRest(item._id)}
          >
            <Text style={[styles.restChipText, selectedRest === item._id && { color: COLORS.gold }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <GoldButton title="Nueva Reseña" onPress={() => setModalVisible(true)} style={{ marginBottom: 16 }} />

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loadingReviews} onRefresh={() => loadReviews(selectedRest)} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.restName}>{restaurants.find((r) => r._id === item.restaurant)?.name || "Restaurante"}</Text>
              <Text style={styles.rating}>{item.rating}/5</Text>
            </View>
            {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay reseñas para este restaurante" />}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Nueva Reseña" onConfirm={handleCreate} confirmText="Publicar" confirmLoading={saving}>
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginBottom: 8 }}>RESTAURANTE</Text>
        {restaurants.map((r) => (
          <TouchableOpacity
            key={r._id}
            style={[styles.restOption, selectedRest === r._id && styles.restOptionActive]}
            onPress={() => setSelectedRest(r._id)}
          >
            <Text style={[styles.restOptionText, selectedRest === r._id && { color: COLORS.gold }]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 12, marginBottom: 8 }}>PUNTUACIÓN</Text>
        <View style={{ flexDirection: "row", gap: 4, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Text style={{ fontSize: 28, color: n <= rating ? COLORS.gold : COLORS.textMuted }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="Escribe tu comentario..."
          placeholderTextColor={COLORS.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
        />
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  sectionLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 },
  restChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: "transparent",
  },
  restChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  restChipText: { fontSize: 13, color: COLORS.textMuted },
  restName: { fontSize: 15, color: COLORS.text, fontWeight: "600", flex: 1 },
  rating: { fontSize: 14, color: COLORS.gold, fontWeight: "700" },
  comment: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  restOption: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: 6,
  },
  restOptionActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.08)" },
  restOptionText: { fontSize: 14, color: COLORS.text },
  textArea: {
    backgroundColor: COLORS.warmDark, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 14, minHeight: 80, textAlignVertical: "top",
  },
});

export default ReviewsScreen;
