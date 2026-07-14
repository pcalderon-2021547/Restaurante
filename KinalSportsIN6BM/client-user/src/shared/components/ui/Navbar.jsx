import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

const Navbar = ({ title }) => {
  const user = useAuthStore((state) => state.user);
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  return (
    <View style={styles.navbar}>
      <Text style={styles.brand}>Restaurante</Text>
      <View style={styles.right}>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 56, backgroundColor: COLORS.charcoal, borderBottomWidth: 1, borderBottomColor: "#2a2218",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  brand: {
    fontSize: 15, fontWeight: "500", letterSpacing: 2, textTransform: "uppercase", color: COLORS.gold,
  },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: COLORS.obsidian, fontWeight: "700", fontSize: 14 },
});

export default Navbar;