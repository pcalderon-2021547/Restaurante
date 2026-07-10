import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Common";
import { useReviews } from "../hooks/useReviews";
import { MaterialIcons } from "@expo/vector-icons";

const ReviewScreen = ({ route, navigation }) => {
  const restaurantId = route.params?.restaurantId || route.params?.restaurant?._id;
  const restaurantName = route.params?.restaurant?.name || "este restaurante";
  const existing = route.params?.review || null;
  const { createReview, updateReview, deleteReview, loading } = useReviews();

  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || "");

  const isEditing = !!existing;

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert("Error", "Selecciona una calificación"); return; }
    try {
      if (isEditing) {
        await updateReview(existing._id, { rating, comment: comment.trim() });
      } else {
        await createReview({ restaurant: restaurantId, rating, comment: comment.trim() });
      }
      Alert.alert("¡Gracias!", `Tu reseña ha sido ${isEditing ? "actualizada" : "publicada"}.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar reseña", "¿Estás seguro? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await deleteReview(existing._id);
          Alert.alert("Eliminada", "Tu reseña ha sido eliminada.", [{ text: "OK", onPress: () => navigation.goBack() }]);
        } catch (err) {
          Alert.alert("Error", err.message);
        }
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <MaterialIcons name="rate-review" size={32} color={COLORS.primary} />
        <Text style={styles.title}>{isEditing ? "Edita tu reseña" : `Califica ${restaurantName}`}</Text>
        <Text style={styles.subtitle}>{isEditing ? "Modifica tu calificación y comentario" : "Comparte tu experiencia"}</Text>
      </Card>

      <Card style={styles.ratingCard}>
        <Text style={styles.label}>Tu calificación</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <MaterialIcons name="star" size={44} color={i <= rating ? "#f59e0b" : "#e2e8f0"} />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {["", "Pésimo", "Malo", "Regular", "Bueno", "Excelente"][rating]}
          </Text>
        )}
      </Card>

      <Card style={styles.commentCard}>
        <Text style={styles.label}>Comentario (opcional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Cuéntanos sobre tu experiencia..."
          placeholderTextColor={COLORS.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          textAlignVertical="top"
        />
      </Card>

      <Button
        title={isEditing ? "Actualizar reseña" : "Publicar reseña"}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />

      {isEditing && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <MaterialIcons name="delete" size={18} color={COLORS.error} />
          <Text style={styles.deleteText}>Eliminar reseña</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  headerCard: { alignItems: "center", paddingVertical: SPACING.xl },
  title: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginTop: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 4 },
  ratingCard: { alignItems: "center", paddingVertical: SPACING.lg },
  label: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.md },
  stars: { flexDirection: "row", gap: SPACING.sm },
  ratingLabel: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary, marginTop: SPACING.sm },
  commentCard: { marginBottom: SPACING.md },
  commentInput: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text, minHeight: 120 },
  submitBtn: { marginTop: SPACING.md },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: SPACING.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.error + "40", borderRadius: 10 },
  deleteText: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.error },
});

export default ReviewScreen;
