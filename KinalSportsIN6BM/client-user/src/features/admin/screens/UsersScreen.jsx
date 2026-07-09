import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useAdminUsers } from "../hooks/useAdminUsers";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
} from "../../../shared/constants/theme";
import {
  LoadingSpinner,
  EmptyState,
  Card,
} from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";

const UserItem = ({ item }) => (
  <Card style={styles.userCard}>
    <View style={styles.userHeader}>
      <Text style={styles.userName}>{item.name} {item.surname}</Text>
      <View style={[styles.roleBadge, item.role === "ADMIN_ROLE" ? styles.adminBadge : styles.userBadge]}>
        <Text style={styles.roleText}>
          {item.role === "ADMIN_ROLE"
            ? "Admin"
            : item.role === "ADMIN_RESTAURANT_ROLE"
              ? "Admin Rest."
              : "User"}
        </Text>
      </View>
    </View>
    <Text style={styles.userInfo}>@{item.username}</Text>
    <Text style={styles.userInfo}>{item.email}</Text>
    <View style={styles.statusRow}>
      <Text style={[styles.statusText, item.emailVerified ? styles.verified : styles.pending]}>
        {item.emailVerified ? "Verificado" : "Pendiente"}
      </Text>
    </View>
  </Card>
);

const UsersScreen = ({ navigation }) => {
  const { users, loading, error, getUsers } = useAdminUsers();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const onRefresh = useCallback(() => {
    getUsers();
  }, [getUsers]);

  if (loading && !users.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {error && !users.length ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <UserItem item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState message="No hay usuarios" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
  },
  userCard: {
    marginBottom: SPACING.sm,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: COLORS.primary + "20",
  },
  userBadge: {
    backgroundColor: COLORS.secondary + "20",
  },
  roleText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "700",
    color: COLORS.text,
  },
  userInfo: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    marginTop: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "600",
  },
  verified: {
    color: COLORS.success,
  },
  pending: {
    color: COLORS.warning,
  },
});

export default UsersScreen;
