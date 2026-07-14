import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as restaurantService from "../../../shared/api/restaurantService";

const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getEvents();
      setEvents(res.data?.events || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Badge text={item.status} variant={item.status === "active" ? "success" : item.status === "finished" ? "info" : "warning"} />
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.date}>📅 {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay eventos disponibles" />}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontFamily: "serif", fontSize: 18, color: COLORS.text, flex: 1 },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, lineHeight: 18 },
  date: { fontSize: 12, color: COLORS.textSubtle },
});

export default EventsScreen;