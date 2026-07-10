import { ActivityIndicator, View, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";

const LoadingSpinner = ({ fullScreen }) => (
  <View style={[styles.center, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size="large" color={COLORS.gold} />
  </View>
);

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center", minHeight: 150 },
  fullScreen: { flex: 1, backgroundColor: COLORS.background },
});

export default LoadingSpinner;