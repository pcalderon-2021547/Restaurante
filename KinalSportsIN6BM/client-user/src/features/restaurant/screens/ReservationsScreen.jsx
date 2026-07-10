import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import * as restaurantService from "../../../shared/api/restaurantService";

const RES_STATUS = {
  pending: { icon: "time-outline", color: COLORS.gold, bg: "rgba(201,168,76,0.08)" },
  confirmed: { icon: "checkmark-circle-outline", color: COLORS.success, bg: "rgba(52,211,153,0.08)" },
  cancelled: { icon: "close-circle-outline", color: COLORS.error, bg: "rgba(224,90,90,0.08)" },
};

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

const ReservationCard = ({ reservation, restaurantName, onCancel }) => {
  const statusInfo = RES_STATUS[reservation.status] || RES_STATUS.pending;
  const date = new Date(reservation.date);

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: statusInfo.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.cardRestaurant}>{restaurantName}</Text>
            <StatusBadge status={reservation.status} />
          </View>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardInfoItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.cardInfoText}>
              {date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
          <View style={styles.cardInfoItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.cardInfoText}>
              {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
          <View style={styles.cardInfoItem}>
            <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.cardInfoText}>{reservation.numberOfPeople} personas</Text>
          </View>
        </View>
        {reservation.notes ? (
          <View style={styles.cardNotes}>
            <Ionicons name="chatbubble-ellipses-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.cardNotesText}>{reservation.notes}</Text>
          </View>
        ) : null}
        {reservation.status === "pending" && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(reservation._id)}>
            <Text style={styles.cancelBtnText}>Cancelar reserva</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ReservationsScreen = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRest, setSelectedRest] = useState("");
  const [resDate, setResDate] = useState("");
  const [resTime, setResTime] = useState("");
  const [people, setPeople] = useState("2");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [resRes, restRes] = await Promise.all([
        restaurantService.getMyReservations().catch(() => ({ data: { reservations: [] } })),
        restaurantService.getRestaurants().catch(() => ({ data: { restaurants: [] } })),
      ]);
      setReservations(resRes.data?.reservations || []);
      setRestaurants(restRes.data?.restaurants || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!selectedRest || !resDate) return Alert.alert("Error", "Selecciona restaurante y fecha");
    try {
      setSaving(true);
      const dateTime = new Date(`${resDate}T${resTime || "12:00"}`).toISOString();
      await restaurantService.createReservation({
        restaurant: selectedRest,
        date: dateTime,
        numberOfPeople: parseInt(people, 10),
        notes,
      });
      Alert.alert("Éxito", "Reserva creada");
      setModalVisible(false);
      resetForm();
      load();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al crear reserva");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedRest("");
    setResDate("");
    setResTime("");
    setPeople("2");
    setNotes("");
  };

  const handleCancel = (id) => {
    Alert.alert("Cancelar Reserva", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí", style: "destructive",
        onPress: async () => {
          try {
            await restaurantService.cancelReservation(id);
            load();
          } catch { Alert.alert("Error", "No se pudo cancelar"); }
        },
      },
    ]);
  };

  const getRestName = (id) => {
    const r = restaurants.find((r) => r._id === id);
    return r?.name || "Restaurante";
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Reservas</Text>
          <Text style={styles.headerSub}>{reservations.length} reserva{reservations.length !== 1 ? "s" : ""}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={COLORS.obsidian} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            restaurantName={getRestName(item.restaurant)}
            onCancel={handleCancel}
          />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No hay reservas</Text>
            <Text style={styles.emptySub}>Toca + para crear tu primera reserva</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => { setModalVisible(false); resetForm(); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                if (step === 1) { setModalVisible(false); resetForm(); } else { setStep(step - 1); }
              }}>
                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nueva Reserva</Text>
              <Text style={styles.modalStep}>{step}/3</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {step === 1 && (
                <>
                  <Text style={styles.sectionLabel}>Elige un restaurante</Text>
                  <View style={{ gap: 8 }}>
                    {restaurants.map((r) => (
                      <TouchableOpacity
                        key={r._id}
                        style={[styles.restOption, selectedRest === r._id && styles.restOptionActive]}
                        onPress={() => { setSelectedRest(r._id); setStep(2); }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.restDot, selectedRest === r._id && styles.restDotActive]}>
                          {selectedRest === r._id && <Ionicons name="checkmark" size={14} color={COLORS.obsidian} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.restName}>{r.name}</Text>
                          {r.address && <Text style={styles.restAddr}>{r.address}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={styles.sectionLabel}>Fecha</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {dates.map((d) => {
                      const dateStr = d.toISOString().split("T")[0];
                      const isSelected = resDate === dateStr;
                      const isToday = dateStr === todayStr;
                      const dayName = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
                      const dayNum = d.getDate();
                      const month = d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
                      return (
                        <TouchableOpacity
                          key={dateStr}
                          style={[styles.dateChip, isSelected && styles.dateChipActive]}
                          onPress={() => setResDate(dateStr)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>{dayName}</Text>
                          <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>{dayNum}</Text>
                          <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>{month}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <Text style={styles.sectionLabel}>Hora</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((t) => {
                      const isSelected = resTime === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.timeChip, isSelected && styles.timeChipActive]}
                          onPress={() => setResTime(t)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.modalActions}>
                    <GoldButton title="Continuar" onPress={() => { if (!resDate || !resTime) return Alert.alert("Selecciona fecha y hora"); setStep(3); }} />
                  </View>
                </>
              )}

              {step === 3 && (
                <>
                  <Text style={styles.sectionLabel}>Personas</Text>
                  <View style={styles.peopleGrid}>
                    {PEOPLE_OPTIONS.map((p) => {
                      const isSelected = String(people) === String(p);
                      return (
                        <TouchableOpacity
                          key={p}
                          style={[styles.peopleChip, isSelected && styles.peopleChipActive]}
                          onPress={() => setPeople(String(p))}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.peopleText, isSelected && styles.peopleTextActive]}>{p}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.sectionLabel}>Notas (opcional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Alergias, preferencias..."
                    placeholderTextColor={COLORS.placeholder}
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.modalActions}>
                    <GoldButton
                      title={saving ? "Creando..." : "Confirmar Reserva"}
                      onPress={handleCreate}
                      loading={saving}
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontFamily: "serif", fontSize: 26, color: COLORS.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.gold,
    alignItems: "center", justifyContent: "center",
  },

  card: {
    flexDirection: "row", borderRadius: 12, overflow: "hidden", marginBottom: 10,
    ...SHADOWS.sm,
  },
  cardAccent: { width: 4 },
  cardBody: {
    flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderLeftWidth: 0,
    borderColor: COLORS.borderLight, padding: 14,
    borderTopRightRadius: 12, borderBottomRightRadius: 12,
  },
  cardTop: { marginBottom: 8 },
  cardTopLeft: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardRestaurant: { fontSize: 15, color: COLORS.text, fontWeight: "600", flex: 1, marginRight: 8 },
  cardInfo: { gap: 6 },
  cardInfoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardInfoText: { fontSize: 13, color: COLORS.textSecondary },
  cardNotes: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  cardNotesText: { fontSize: 12, color: COLORS.textMuted, flex: 1 },
  cancelBtn: { marginTop: 10, alignSelf: "flex-start" },
  cancelBtnText: { fontSize: 12, color: COLORS.error, fontWeight: "600" },

  empty: { alignItems: "center", paddingTop: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(201,168,76,0.06)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 17, color: COLORS.text, fontWeight: "600", marginBottom: 4 },
  emptySub: { fontSize: 13, color: COLORS.textMuted, textAlign: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: "85%",
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 18, color: COLORS.text, fontWeight: "600" },
  modalStep: { fontSize: 12, color: COLORS.textMuted },

  sectionLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 1.2, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 12 },

  restOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.borderLight, backgroundColor: COLORS.warmDark,
  },
  restOptionActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.06)" },
  restDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  restDotActive: { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  restName: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  restAddr: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  dateChip: {
    alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.borderLight, marginRight: 8, minWidth: 64,
    backgroundColor: COLORS.warmDark,
  },
  dateChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  dateDay: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  dateNum: { fontSize: 18, color: COLORS.text, fontWeight: "700" },
  dateMonth: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  dateDayActive: { color: COLORS.gold },
  dateNumActive: { color: COLORS.gold },
  dateMonthActive: { color: COLORS.gold },

  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.borderLight, backgroundColor: COLORS.warmDark,
  },
  timeChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  timeText: { fontSize: 13, color: COLORS.text },
  timeTextActive: { color: COLORS.gold, fontWeight: "600" },

  peopleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  peopleChip: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.borderLight, backgroundColor: COLORS.warmDark,
  },
  peopleChipActive: { borderColor: COLORS.gold, backgroundColor: "rgba(201,168,76,0.1)" },
  peopleText: { fontSize: 14, color: COLORS.text },
  peopleTextActive: { color: COLORS.gold, fontWeight: "600" },

  notesInput: {
    backgroundColor: COLORS.warmDark, borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14, marginBottom: 20, textAlignVertical: "top",
    minHeight: 80,
  },

  modalActions: { marginTop: 8, marginBottom: 16 },
});

export default ReservationsScreen;