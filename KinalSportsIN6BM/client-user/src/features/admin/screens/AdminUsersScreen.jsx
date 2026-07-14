import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import Badge from "../../../shared/components/ui/Badge";
import GoldButton from "../../../shared/components/ui/GoldButton";
import GoldInput from "../../../shared/components/ui/GoldInput";
import Modal from "../../../shared/components/ui/Modal";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import EmptyState from "../../../shared/components/ui/EmptyState";
import * as userService from "../../../shared/api/userService";

const ROLES = ["USER_ROLE", "ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"];

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER_ROLE");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const res = await userService.getUsers(pageNum, 10);
      const data = res.data?.data || [];
      setUsers(append ? (prev) => [...prev, ...data] : data);
      setHasMore(data.length === 10);
      setPage(pageNum);
    } catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al cargar usuarios"); } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadMore = () => { if (hasMore && !loadingMore) load(page + 1, true); };

  const openCreate = () => {
    setEditing(null);
    setName(""); setSurname(""); setUsername(""); setEmail(""); setPassword(""); setRole("USER_ROLE");
    setModalVisible(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setName(user.name); setSurname(user.surname); setUsername(user.username);
    setEmail(user.email); setPassword(""); setRole(user.role);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) {
        await userService.updateUser(editing.id, { name, surname, ...(password ? { password } : {}) });
      } else {
        await userService.createUser({ name, surname, username, email, password, role });
      }
      setModalVisible(false);
      load();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Eliminar Usuario", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await userService.deleteUser(id); load(); }
        catch (err) { Alert.alert("Error", err.response?.data?.message || "Error al eliminar"); }
      }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenWrapper>
      <GoldButton title="+ Nuevo Usuario" onPress={openCreate} style={{ marginBottom: 16 }} />
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.gold} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name} {item.surname}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Badge text={item.role} variant={item.role === "ADMIN_ROLE" ? "gold" : item.role === "ADMIN_RESTAURANT_ROLE" ? "info" : "success"} />
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <GoldButton title="Editar" onPress={() => openEdit(item)} small />
                  <GoldButton title="Eliminar" onPress={() => handleDelete(item.id)} small />
                </View>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState message="No hay usuarios" />}
      />

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? "Editar Usuario" : "Nuevo Usuario"} onConfirm={handleSave} confirmText={editing ? "Actualizar" : "Crear"} confirmLoading={saving}>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre" />
        <GoldInput label="Apellido" value={surname} onChangeText={setSurname} placeholder="Apellido" />
        <GoldInput label="Usuario" value={username} onChangeText={setUsername} placeholder="usuario" autoCapitalize="none" />
        <GoldInput label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" autoCapitalize="none" keyboardType="email-address" />
        <GoldInput label={editing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"} value={password} onChangeText={setPassword} placeholder="********" secureTextEntry />
        <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6 }}>Rol</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r} onPress={() => setRole(r)}
              style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: role === r ? COLORS.gold : COLORS.border, backgroundColor: role === r ? "rgba(201,168,76,0.1)" : "transparent" }}
            >
              <Text style={{ fontSize: 12, color: role === r ? COLORS.gold : COLORS.textMuted }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 15, color: COLORS.text, fontWeight: "600" },
  email: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  username: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
});

export default AdminUsersScreen;