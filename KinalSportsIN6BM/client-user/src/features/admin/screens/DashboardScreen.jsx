import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { Card } from "../../../shared/components/Common";
import { useAdminUsers } from "../hooks/useAdminUsers";

const DashboardScreen = ({ navigation }) => {
  const { users, loading, getUsers } = useAdminUsers();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <View style={styles.grid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statLabel}>Restaurantes</Text>
        </Card>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.navigate("UsersList")}>
          <Card style={styles.menuCard}>
            <Text style={styles.menuTitle}>Usuarios</Text>
            <Text style={styles.menuDesc}>Gestionar usuarios del sistema</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("RestaurantsList")}>
          <Card style={styles.menuCard}>
            <Text style={styles.menuTitle}>Restaurantes</Text>
            <Text style={styles.menuDesc}>Gestionar restaurantes</Text>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  statNumber: {
    fontSize: FONT_SIZE.huge || 32,
    fontWeight: "800",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  menu: {
    gap: SPACING.sm,
  },
  menuCard: {
    paddingVertical: SPACING.lg,
  },
  menuTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
  },
  menuDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
