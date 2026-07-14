import React, { useEffect, useCallback, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, Modal, TextInput, ScrollView
} from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import { LoadingSpinner, EmptyState, Card } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import userClient from "../../../shared/api/userClient";
import { MaterialIcons } from "@expo/vector-icons";

const ROLES = ["USER_ROLE", "ADMIN_ROLE", "ADMIN_RESTAURANT_ROLE"];

const UserItem = ({ item, onEdit, onDelete }) => (
  <Card style={styles.userCard}>
    <View style={styles.userHeader}>
      <View style={[styles.avatarBox, { backgroundColor: COLORS.primary + "15" }]}>
        <MaterialIcons name="person" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name} {item.surname}</Text>
        <Text style={styles.userHandle}>@{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>
          {item.role === "ADMIN_ROLE" ? "Admin"
            : item.role === "ADMIN_RESTAURANT_ROLE" ? "Rest."
            : "User"}
        </Text>
      </View>
    </View>
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, item.emailVerified ? styles.verifiedDot : styles.pendingDot]} />
      <Text style={[styles.statusLabel, item.emailVerified ? styles.verified : styles.pending]}>
        {item.emailVerified ? "Verificado" : "Pendiente"}
      </Text>
      {item.phone && <Text style={styles.phoneText}>Tel: {item.phone}</Text>}
    </View>
    <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.actionChip} onPress={() => onEdit(item)}>
        <MaterialIcons name="edit" size={16} color={COLORS.primary} />
        <Text style={styles.actionText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionChip} onPress={() => onDelete(item)}>
        <MaterialIcons name="delete" size={16} color={COLORS.error} />
        <Text style={[styles.actionText, { color: COLORS.error }]}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER_ROLE");
  const [phone, setPhone] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userClient.get("/users", { params: { limit: 100 } });
      if (data.success) setUsers(data.data || []);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setSurname(""); setUsername(""); setEmail(""); setPassword(""); setPhone("");
    setRole("USER_ROLE");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setSurname(item.surname); setUsername(item.username);
    setEmail(item.email); setPassword(""); setRole(item.role); setPhone(item.phone || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !surname.trim() || !username.trim() || !email.trim()) {
      Alert.alert("Error", "Nombre, apellido, usuario y email obligatorios"); return;
    }
    if (!editing && !password.trim()) {
      Alert.alert("Error", "Contraseña obligatoria para nuevo usuario"); return;
    }

    const body = {
      name: name.trim(), surname: surname.trim(), username: username.trim(),
      email: email.trim(), role, phone: phone.trim(),
    };
    if (password.trim()) body.password = password.trim();

    try {
      if (editing) {
        await userClient.put(`/users/${editing.id}`, body);
      } else {
        await userClient.post("/users/create", body);
      }
      setModalVisible(false);
      fetch();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al guardar");
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Eliminar usuario",
      `¿Eliminar a ${item.name} ${item.surname}?${item.role === "ADMIN_ROLE" ? "\n\nSe enviará un correo de confirmación para administradores." : ""}`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            const { data } = await userClient.delete(`/users/${item.id}`);
            Alert.alert("Eliminado", data.message || "Usuario eliminado");
            fetch();
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Error al eliminar");
          }
        }},
      ]
    );
  };

  if (loading && !users.length) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <UserItem item={item} onEdit={openEdit} onDelete={handleDelete} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetch} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <MaterialIcons name="person-add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Nuevo usuario</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<EmptyState message="No hay usuarios" />}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? "Editar" : "Nuevo"} usuario</Text>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Apellido *</Text>
            <TextInput style={styles.input} value={surname} onChangeText={setSurname} />
            <Text style={styles.label}>Usuario *</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Contraseña {editing ? "(dejar vacío para mantener)" : "*"}</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.label}>Rol</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r} style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                    {r === "ADMIN_ROLE" ? "Admin" : r === "ADMIN_RESTAURANT_ROLE" ? "Rest." : "Usuario"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: 10, marginBottom: SPACING.md },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: FONT_SIZE.md },
  userCard: { marginBottom: SPACING.sm },
  userHeader: { flexDirection: "row", gap: SPACING.md, alignItems: "center" },
  avatarBox: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.text },
  userHandle: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 1 },
  userEmail: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, marginTop: 1 },
  roleBadge: { backgroundColor: COLORS.primary + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  verifiedDot: { backgroundColor: COLORS.success },
  pendingDot: { backgroundColor: COLORS.warning },
  statusLabel: { fontSize: FONT_SIZE.xs, fontWeight: "600" },
  verified: { color: COLORS.success },
  pending: { color: COLORS.warning },
  phoneText: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, marginLeft: "auto" },
  actionsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.background },
  actionText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg, maxHeight: "90%" },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text },
  roleRow: { flexDirection: "row", gap: SPACING.sm, marginTop: 4 },
  roleBtn: { flex: 1, padding: SPACING.sm, borderRadius: 8, backgroundColor: COLORS.background, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  roleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  roleBtnTextActive: { color: "#fff" },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
});

export default UsersScreen;
