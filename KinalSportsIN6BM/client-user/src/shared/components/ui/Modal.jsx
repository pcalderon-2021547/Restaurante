import { Modal as RNModal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { COLORS, FONT_SIZE } from "../../constants/theme";
import GoldButton from "./GoldButton";
import OutlineButton from "./OutlineButton";

const Modal = ({ visible, onClose, title, children, onConfirm, confirmText, confirmLoading, hideActions }) => (
  <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {!hideActions && (
          <View style={styles.footer}>
            <OutlineButton title="Cancelar" onPress={onClose} small />
            {onConfirm && (
              <GoldButton title={confirmText || "Guardar"} onPress={onConfirm} loading={confirmLoading} small />
            )}
          </View>
        )}
      </View>
    </View>
  </RNModal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.68)", justifyContent: "center",
    alignItems: "center", padding: 24,
  },
  card: {
    width: "100%", maxWidth: 500, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 16,
    maxHeight: "85%",
  },
  header: {
    background: "linear-gradient(135deg, #1c1408 0%, #0a0906 100%)",
    padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: "serif", fontSize: 22, fontWeight: "400", color: COLORS.gold, letterSpacing: 1,
  },
  body: { padding: 20 },
  footer: {
    flexDirection: "row", justifyContent: "flex-end", gap: 12,
    padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
});

export default Modal;