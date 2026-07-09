import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image, TextInput, TouchableOpacity, Modal } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme";
import Button from "../../../shared/components/Button";
import { Card, LoadingSpinner } from "../../../shared/components/Common";
import { useAuthStore } from "../../../shared/store/authStore";
import { useProfile } from "../../home/hooks/useProfile";
import authClient from "../../../shared/api/authClient";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import avatarDefault from "../../../../assets/avatarDefault.png";

const ProfileScreen = ({ navigation }) => {
  const { user, logout, setUser } = useAuthStore();
  const { profile, loading, getProfile } = useProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [pwModal, setPwModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => { getProfile(); }, [getProfile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSurname(profile.surname || "");
      setPhone(profile.phone || "");
      if (profile.avatar) setAvatarUri(profile.avatar);
    }
  }, [profile]);

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Aceptar", onPress: () => logout() },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !surname.trim()) { Alert.alert("Error", "Nombre y apellidos son obligatorios"); return; }
    setSaving(true);
    try {
      const body = { name: name.trim(), surname: surname.trim(), phone: phone.trim() };
      if (avatarUri && avatarUri !== profile?.avatar) body.avatar = avatarUri;
      await authClient.put("/profile", body);
      Alert.alert("Guardado", "Perfil actualizado correctamente");
      setEditing(false);
      getProfile();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { Alert.alert("Error", "Completa todos los campos"); return; }
    if (newPassword.length < 6) { Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { Alert.alert("Error", "Las contraseñas no coinciden"); return; }
    setSavingPw(true);
    try {
      await authClient.put("/profile", { currentPassword, password: newPassword });
      Alert.alert("Cambiada", "Contraseña actualizada correctamente");
      setPwModal(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "No se pudo cambiar la contraseña");
    } finally {
      setSavingPw(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para cambiar la foto de perfil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const p = profile || user;

  if (loading && !p) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
          <Image source={avatarUri ? { uri: avatarUri } : avatarDefault} style={styles.avatarImage} />
          <View style={styles.avatarOverlay}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{p?.name || ""} {p?.surname || ""}</Text>
        <Text style={styles.userHandle}>@{p?.username || ""}</Text>
        <Text style={styles.userEmail}>{p?.email || ""}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {p?.role === "ADMIN_ROLE" ? "Administrador" : p?.role === "ADMIN_RESTAURANT_ROLE" ? "Admin. Restaurante" : "Usuario"}
          </Text>
        </View>
        <TouchableOpacity style={styles.editToggle} onPress={() => setEditing(!editing)}>
          <MaterialIcons name={editing ? "close" : "edit"} size={18} color={COLORS.primary} />
          <Text style={styles.editToggleText}>{editing ? "Cancelar" : "Editar perfil"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <Text style={styles.sectionTitle}>{editing ? "Editar información" : "Información"}</Text>
          {editing ? (
            <>
              <Text style={styles.label}>Nombres</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombres" />
              <Text style={styles.label}>Apellidos</Text>
              <TextInput style={styles.input} value={surname} onChangeText={setSurname} placeholder="Apellidos" />
              <Text style={styles.label}>Teléfono</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Teléfono" keyboardType="phone-pad" />
              <Button title="Guardar cambios" onPress={handleSave} loading={saving} style={styles.saveBtn} />
            </>
          ) : (
            <>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Nombres</Text><Text style={styles.infoValue}>{p?.name || "—"}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Apellidos</Text><Text style={styles.infoValue}>{p?.surname || "—"}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Usuario</Text><Text style={styles.infoValue}>{p?.username || "—"}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{p?.email || "—"}</Text></View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Verificado</Text>
                <Text style={[styles.infoValue, p?.emailVerified ? styles.verified : styles.notVerified]}>
                  {p?.emailVerified ? "Sí" : "No"}
                </Text>
              </View>
            </>
          )}
        </Card>

        <TouchableOpacity onPress={() => setPwModal(true)}>
          <Card style={styles.linkCard}>
            <MaterialIcons name="lock" size={22} color={COLORS.primary} />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Cambiar contraseña</Text>
              <Text style={styles.linkDesc}>Actualiza tu contraseña de acceso</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.secondary} />
          </Card>
        </TouchableOpacity>

        {p?.role === "ADMIN_ROLE" && (
          <TouchableOpacity onPress={() => navigation?.getParent?.()?.navigate?.("Dashboard")}>
            <Card style={styles.linkCard}>
              <MaterialIcons name="admin-panel-settings" size={22} color={COLORS.primary} />
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Panel de Administración</Text>
                <Text style={styles.linkDesc}>Gestionar usuarios, restaurantes y más</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.secondary} />
            </Card>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation?.navigate?.("MyReservations")}>
          <Card style={styles.linkCard}>
            <MaterialIcons name="event-note" size={22} color={COLORS.primary} />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Mis reservaciones</Text>
              <Text style={styles.linkDesc}>Ver historial de reservaciones</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.secondary} />
          </Card>
        </TouchableOpacity>

        <Button title="Cerrar Sesión" variant="secondary" onPress={handleLogout} style={styles.logoutBtn} />
        <Text style={styles.version}>Leña y Fuego v1.0.0</Text>
      </View>

      <Modal visible={pwModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cambiar contraseña</Text>
            <Text style={styles.label}>Contraseña actual</Text>
            <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••••" />
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Mín. 6 caracteres" />
            <Text style={styles.label}>Confirmar nueva contraseña</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Repite la contraseña" />
            <View style={styles.modalBtns}>
              <Button title="Cancelar" variant="secondary" onPress={() => setPwModal(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleChangePassword} loading={savingPw} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingVertical: SPACING.xxl, backgroundColor: COLORS.surface, alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarContainer: { position: "relative", marginBottom: SPACING.md },
  avatarImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.primary },
  avatarOverlay: { position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: COLORS.surface },
  userName: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text },
  userHandle: { fontSize: FONT_SIZE.md, color: COLORS.secondary, marginTop: 2 },
  userEmail: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
  roleBadge: { marginTop: SPACING.sm, backgroundColor: COLORS.primary + "15", paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: FONT_SIZE.xs, fontWeight: "700", color: COLORS.primary },
  editToggle: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.md, padding: SPACING.sm, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
  editToggleText: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.primary },
  content: { padding: SPACING.lg },
  profileCard: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text, marginTop: SPACING.sm, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: SPACING.md, fontSize: FONT_SIZE.md, color: COLORS.text, marginBottom: SPACING.sm },
  saveBtn: { marginTop: SPACING.md },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: FONT_SIZE.md, color: COLORS.secondary },
  infoValue: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.text },
  verified: { color: COLORS.success },
  notVerified: { color: COLORS.warning },
  linkCard: { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginBottom: SPACING.sm },
  linkContent: { flex: 1 },
  linkTitle: { fontSize: FONT_SIZE.md, fontWeight: "600", color: COLORS.text },
  linkDesc: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, marginTop: 2 },
  logoutBtn: { marginTop: SPACING.lg },
  version: { textAlign: "center", marginTop: SPACING.xxl, color: COLORS.textLight, paddingBottom: SPACING.xl, fontSize: FONT_SIZE.xs },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.lg },
  modalBtns: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
});

export default ProfileScreen;
