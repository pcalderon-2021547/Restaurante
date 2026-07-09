import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card, LoadingSpinner } from "../../../shared/components/Common";
import { useTables } from "../hooks/useTables";
import { useReservations } from "../hooks/useReservations";
import { useAuthStore } from "../../../shared/store/authStore";
import { MaterialIcons } from "@expo/vector-icons";

const ReservationScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { user } = useAuthStore();
  const { tables, loading: tablesLoading, getTables } = useTables();
  const { createReservation, loading: submitting } = useReservations();

  const [selectedTable, setSelectedTable] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("2");
  const [notes, setNotes] = useState("");

  const fullName = user ? `${user.name || ""} ${user.surname || ""}`.trim() : "";

  useEffect(() => {
    getTables(restaurant._id);
  }, [restaurant._id]);

  const availableTables = tables.filter(t => t.status === "available" || t.status === "free");

  const handleSubmit = async () => {
    if (!selectedTable) {
      Alert.alert("Error", "Selecciona una mesa");
      return;
    }
    if (!date || !time) {
      Alert.alert("Error", "Completa la fecha y hora");
      return;
    }
    if (!people || parseInt(people) < 1) {
      Alert.alert("Error", "Indica el número de personas");
      return;
    }

    const dateTimeStr = `${date}T${time}:00.000Z`;
    const parsed = new Date(dateTimeStr);
    if (isNaN(parsed.getTime())) {
      Alert.alert("Error", "Fecha u hora inválida");
      return;
    }

    try {
      await createReservation({
        table: selectedTable,
        numberOfPeople: parseInt(people),
        date: parsed.toISOString(),
        notes,
        customerName: fullName || "Cliente",
        customerPhone: user?.phone || "00000000",
      });
      Alert.alert("¡Reservado!", "Tu reservación ha sido creada.", [
        { text: "Ver mis reservaciones", onPress: () => navigation.getParent()?.navigate("Reservations") || navigation.goBack() },
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  if (tablesLoading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.restaurantCard}>
        <MaterialIcons name="restaurant" size={24} color={COLORS.primary} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantDetail}>Reservación</Text>
        </View>
      </Card>

      {fullName ? (
        <Card style={styles.userCard}>
          <MaterialIcons name="person" size={18} color={COLORS.secondary} />
          <Text style={styles.userName}>{fullName}</Text>
        </Card>
      ) : null}

      <Text style={styles.sectionLabel}>Fecha</Text>
      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={COLORS.textLight}
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.sectionLabel}>Hora</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM (24h)"
        placeholderTextColor={COLORS.textLight}
        value={time}
        onChangeText={setTime}
      />

      <Text style={styles.sectionLabel}>Personas</Text>
      <TextInput
        style={styles.input}
        placeholder="Número de personas"
        placeholderTextColor={COLORS.textLight}
        value={people}
        onChangeText={setPeople}
        keyboardType="number-pad"
      />

      <Text style={styles.sectionLabel}>Selecciona una mesa</Text>
      {availableTables.length === 0 ? (
        <Card>
          <Text style={styles.noTables}>No hay mesas disponibles en este momento</Text>
        </Card>
      ) : (
        <View style={styles.tableGrid}>
          {availableTables.map(table => {
            const isSelected = selectedTable === table._id;
            const fits = parseInt(people) <= table.capacity;
            return (
              <TouchableOpacity
                key={table._id}
                style={[
                  styles.tableCard,
                  isSelected && styles.tableSelected,
                  !fits && styles.tableUnsuitable,
                ]}
                onPress={() => fits && setSelectedTable(table._id)}
                disabled={!fits}
              >
                <MaterialIcons
                  name={isSelected ? "check-circle" : "table-restaurant"}
                  size={24}
                  color={isSelected ? "#fff" : fits ? COLORS.primary : COLORS.textLight}
                />
                <Text style={[styles.tableNumber, isSelected && styles.tableTextSelected]}>
                  Mesa {table.number}
                </Text>
                <Text style={[styles.tableCap, isSelected && styles.tableTextSelected]}>
                  {table.capacity} pers.
                </Text>
                {table.location && (
                  <Text style={[styles.tableLoc, isSelected && styles.tableTextSelected]}>
                    {table.location}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionLabel}>Notas (opcional)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Alergias, ocasión especial..."
        placeholderTextColor={COLORS.textLight}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Button
        title="Confirmar reservación"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text },
  restaurantDetail: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  userCard: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md },
  userName: { fontSize: FONT_SIZE.md, color: COLORS.text },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notesInput: { minHeight: 80, textAlignVertical: "top" },
  noTables: { textAlign: "center", color: COLORS.secondary, padding: SPACING.md },
  tableGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.sm },
  tableCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    gap: 4,
  },
  tableSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tableUnsuitable: { opacity: 0.4 },
  tableNumber: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  tableCap: { fontSize: FONT_SIZE.xs, color: COLORS.secondary },
  tableLoc: { fontSize: 11, color: COLORS.textLight },
  tableTextSelected: { color: "#fff" },
  submitBtn: { marginTop: SPACING.lg, marginBottom: SPACING.xxl },
});

export default ReservationScreen;
