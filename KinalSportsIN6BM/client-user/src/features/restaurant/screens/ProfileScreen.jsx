import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONT_SIZE } from "../../../shared/constants/theme";
import ScreenWrapper from "../../../shared/components/ui/ScreenWrapper";
import Card from "../../../shared/components/ui/Card";
import GoldInput from "../../../shared/components/ui/GoldInput";
import GoldButton from "../../../shared/components/ui/GoldButton";
import DangerButton from "../../../shared/components/ui/DangerButton";
import * as userService from "../../../shared/api/userService";
import * as restaurantService from "../../../shared/api/restaurantService";
import { useAuthStore } from "../../../shared/store/authStore";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permiso requerido", "Se necesita acceso a la galería");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: () => logout() },
    ]);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      if (imageUri) {
        await restaurantService.updateProfileWithImage({ name, surname }, imageUri);
      } else {
        await userService.updateProfile({ name, surname });
      }
      useAuthStore.getState().setUserField("name", name);
      useAuthStore.getState().setUserField("surname", surname);
      setImageUri(null);
      Alert.alert("Perfil actualizado");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() + (user.surname ? user.surname.charAt(0).toUpperCase() : "") : "U";

  return (
    <ScreenWrapper scroll>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.changePhoto}>Cambiar foto</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name} {user?.surname}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>Rol: {user?.role || "USER_ROLE"}</Text>
      </View>

      <Card style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Editar Perfil</Text>
        <GoldInput label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
        <GoldInput label="Apellido" value={surname} onChangeText={setSurname} placeholder="Tu apellido" />
        <GoldButton title={saving ? "Guardando..." : "Guardar Cambios"} onPress={handleUpdate} loading={saving} />
      </Card>

      <DangerButton title="Cerrar Sesión" onPress={handleLogout} style={{ marginTop: 24 }} />

      <Text style={styles.version}>Restaurante App v1.0.0</Text>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  avatarContainer: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold,
    alignItems: "center", justifyContent: "center",
  },
  changePhoto: { color: COLORS.gold, fontSize: 12, marginTop: 6, marginBottom: 12, textAlign: "center" },
  avatarText: { fontSize: 28, color: COLORS.obsidian, fontWeight: "700" },
  userName: { fontFamily: "serif", fontSize: 22, color: COLORS.text },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  userRole: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  sectionTitle: { fontFamily: "serif", fontSize: 18, color: COLORS.gold, marginBottom: 16 },
  version: { textAlign: "center", color: COLORS.textMuted, fontSize: 12, marginTop: 24, marginBottom: 32 },
});

export default ProfileScreen;