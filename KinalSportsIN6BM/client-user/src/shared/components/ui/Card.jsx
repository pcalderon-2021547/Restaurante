import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
});

export default Card;