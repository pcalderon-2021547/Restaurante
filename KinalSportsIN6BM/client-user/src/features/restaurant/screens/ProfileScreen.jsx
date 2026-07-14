import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import GoldInput from "../../../shared/components/ui/GoldInput";
import GoldButton from "../../../shared/components/ui/GoldButton";
import DangerButton from "../../../shared/components/ui/DangerButton";
import * as userService from "../../../shared/api/userService";
import * as restaurantService from "../../../shared/api/restaurantService";
import { useAuthStore } from "../../../shared/store/authStore";
import { useProfile } from "../../home/hooks/useProfile";
import { confirmAction } from "../../../shared/utils/confirmAction";

const roleLabels = {
  ADMIN_ROLE: "Administrador",
  ADMIN_RESTAURANT_ROLE: "Admin. Restaurante",
  USER_ROLE: "Cliente",
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { getProfile } = useProfile();

  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [imageUri, setImageUri] = useState(null);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user?.profilePicture) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const profile = await getProfile();
      if (profile?.profilePicture) setProfilePicture(profile.profilePicture);
      if (profile?.name) setName(profile.name);
      if (profile?.surname) setSurname(profile.surname);
      if (profile?.username) setUsername(profile.username);
      if (profile?.email) setEmail(profile.email);
      if (profile?.phone) setPhone(profile.phone);
    } catch {
    } finally {
      setLoadingProfile(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permiso requerido", "Se necesita acceso a la galería");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleLogout = () => {
    confirmAction("Cerrar Sesión", "¿Estás seguro?", () => logout());
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const data = { name, surname, username, email, phone };
      if (imageUri) {
        const res = await restaurantService.updateProfileWithImage(data, imageUri);
        const updated = res.data?.user;
        if (updated) {
          useAuthStore.getState().setUser(updated);
          if (updated.profilePicture) setProfilePicture(updated.profilePicture);
        }
      } else {
        const res = await userService.updateProfile(data);
        const updated = res.data?.user;
        if (updated) {
          useAuthStore.getState().setUser(updated);
          if (updated.profilePicture) setProfilePicture(updated.profilePicture);
        }
      }
      setImageUri(null);
      setEditing(false);
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const displayPhoto = imageUri || profilePicture;
  const initials = user?.name
    ? (user.name.charAt(0) + (user.surname ? user.surname.charAt(0) : "")).toUpperCase()
    : "U";
  const roleLabel = roleLabels[user?.role] || user?.role || "Cliente";

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );

  if (loadingProfile && !user) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll>
      <LinearGradient
        colors={["#1c1a16", COLORS.background]}
        locations={[0, 0.6]}
        style={styles.headerGradient}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              {displayPhoto ? (
                <Image source={{ uri: displayPhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name} {user?.surname}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.bodyContainer}>
        <Card style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>
          <View style={styles.divider} />
          <InfoRow icon="👤" label="Nombre" value={user?.name} />
          <InfoRow icon="👤" label="Apellido" value={user?.surname} />
          <InfoRow icon="＠" label="Usuario" value={user?.username} />
          <InfoRow icon="✉" label="Email" value={user?.email} />
          <InfoRow icon="📞" label="Teléfono" value={user?.phone} />
          <InfoRow icon="🔑" label="Rol" value={roleLabel} />
        </Card>

        {editing ? (
          <Card style={styles.editCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>✏</Text>
              <Text style={styles.sectionTitle}>Editar Perfil</Text>
            </View>
            <View style={styles.divider} />
            <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
            <GoldInput label="Apellido" value={surname} onChangeText={setSurname} placeholder="Tu apellido" />
            <GoldInput label="Usuario" value={username} onChangeText={setUsername} placeholder="nombre_usuario" autoCapitalize="none" />
            <GoldInput label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
            <GoldInput label="Teléfono" value={phone} onChangeText={setPhone} placeholder="12345678" keyboardType="numeric" maxLength={8} />
            <View style={styles.editActions}>
              <GoldButton title="Guardar Cambios" onPress={handleUpdate} loading={saving} style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => { setEditing(false); setName(user?.name || ""); setSurname(user?.surname || ""); setUsername(user?.username || ""); setEmail(user?.email || ""); setPhone(user?.phone || ""); setImageUri(null); }} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.8}>
            <Card style={styles.editPromptCard}>
              <Text style={styles.editPromptIcon}>✏</Text>
              <Text style={styles.editPromptText}>Editar perfil</Text>
              <Text style={styles.editPromptArrow}>›</Text>
            </Card>
          </TouchableOpacity>
        )}

        <View style={styles.actionsSection}>
          <DangerButton title="Cerrar Sesión" onPress={handleLogout} />
        </View>

        <Text style={styles.version}>Restaurante App v1.0.0</Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerGradient: {
    paddingTop: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderStrong,
  },

  avatarSection: {
    alignItems: "center",
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.goldLight,
  },

  avatarInitials: {
    fontSize: 40,
    color: COLORS.obsidian,
    fontWeight: "700",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.charcoal,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  cameraIcon: {
    fontSize: 14,
  },

  userName: {
    fontFamily: "serif",
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "600",
    textAlign: "center",
  },

  roleBadge: {
    marginTop: 8,
    backgroundColor: "rgba(201,168,76,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
  },

  roleBadgeText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  bodyContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  infoCard: {
    marginBottom: SPACING.md,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  sectionTitle: {
    fontFamily: "serif",
    fontSize: 17,
    color: COLORS.gold,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  infoIcon: {
    fontSize: 16,
    width: 30,
    textAlign: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    color: COLORS.text,
  },

  editCard: {
    marginBottom: SPACING.md,
  },

  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },

  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  cancelText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },

  editPromptCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingVertical: 16,
  },

  editPromptIcon: {
    fontSize: 18,
    marginRight: 12,
  },

  editPromptText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },

  editPromptArrow: {
    fontSize: 22,
    color: COLORS.textMuted,
  },

  actionsSection: {
    marginTop: 8,
    marginBottom: 8,
  },

  version: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});

export default ProfileScreen;