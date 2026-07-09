import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/theme";

const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, confirmText, danger }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title || "Confirmar"}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, danger && styles.dangerBtn]}
            onPress={onConfirm}
          >
            <Text style={[styles.confirmText, danger && styles.dangerText]}>
              {confirmText || "Aceptar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.68)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: {
    width: "100%", maxWidth: 360, backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 24,
  },
  title: { fontFamily: "serif", fontSize: 20, color: COLORS.text, marginBottom: 8 },
  message: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 20 },
  buttons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  confirmBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, backgroundColor: COLORS.gold },
  dangerBtn: { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORS.error },
  confirmText: { color: COLORS.obsidian, fontSize: 13, fontWeight: "700" },
  dangerText: { color: COLORS.error },
});

export default ConfirmModal;