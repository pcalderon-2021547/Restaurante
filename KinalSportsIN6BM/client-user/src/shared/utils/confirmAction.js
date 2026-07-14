import { Platform, Alert } from "react-native";

export const confirmAction = (title, message, onConfirm, onCancel) => {
  if (Platform.OS === "web" && typeof window !== "undefined" && typeof window.confirm === "function") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: onCancel },
      { text: "Confirmar", style: "destructive", onPress: onConfirm },
    ]);
  }
};
