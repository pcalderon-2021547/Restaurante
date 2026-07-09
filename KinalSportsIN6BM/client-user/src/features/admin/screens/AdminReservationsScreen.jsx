import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import StatusBadge from "../../../shared/components/ui/StatusBadge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const AdminReservationsScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setLoading(true); const res = await restaurantService.getReservations(); setReservations(res.data?.reservations || []); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCancel = (id) => {
    Alert.alert("Cancelar Reserva", "¿Estás seguro?", [
      { text: "No", style: "cancel" },
      { text: "Sí", style: "destructive", onPress: async () => { try { await restaurantService.cancelReservation(id); load(); } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al cancelar"); } }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.customerName}</Text>
                <Text style={styles.detail}>📞 {item.customerPhone}</Text>
                <Text style={styles.detail}>👥 {item.numberOfPeople} pers.</Text>
                <Text style={styles.detail}>📅 {new Date(item.date).toLocaleString()}</Text>
                {item.notes ? <Text style={styles.detail}>📝 {item.notes}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={item.status} />
                {item.status !== "cancelled" && (
                  <GoldButton title="Cancelar" onPress={() => handleCancel(item._id)} small />
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay reservaciones" />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  detail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default AdminReservationsScreen;