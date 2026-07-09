import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../../constants/theme";

const ScreenWrapper = ({ children, scroll, style }) => {
  if (scroll) {
    return (
      <ScrollView style={[styles.container, style]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, flexGrow: 1 },
});

export default ScreenWrapper;