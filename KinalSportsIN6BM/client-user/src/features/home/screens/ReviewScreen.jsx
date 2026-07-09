import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card } from "../../../shared/components/Common";
import { useReviews } from "../hooks/useReviews";
import { MaterialIcons } from "@expo/vector-icons";

const ReviewScreen = ({ route, navigation }) => {
  const restaurantId = route.params?.restaurantId || route.params?.restaurant?._id;
  const restaurantName = route.params?.restaurant?.name || "este restaurante";
  const { createReview, loading } = useReviews();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Selecciona una calificación");
      return;
    }

    try {
      await createReview({
        restaurant: restaurantId,
        rating,
        comment: comment.trim(),
      });
      Alert.alert("¡Gracias!", "Tu reseña ha sido publicada.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <MaterialIcons name="rate-review" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Califica {restaurantName}</Text>
        <Text style={styles.subtitle}>Comparte tu experiencia</Text>
      </Card>

      <Card style={styles.ratingCard}>
        <Text style={styles.label}>Tu calificación</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <MaterialIcons
                name="star"
                size={44}
                color={i <= rating ? "#f59e0b" : "#e2e8f0"}
              />
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
        title="Publicar reseña"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitBtn}
      />
    </View>
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
  commentInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 120,
  },
  submitBtn: { marginTop: SPACING.md },
});

export default ReviewScreen;
