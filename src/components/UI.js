import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius, spacing, shadow } from "../theme";

export function Button({ title, onPress, variant = "primary", disabled, loading, style, textStyle }) {
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
      ? colors.danger
      : variant === "outline"
      ? "transparent"
      : colors.primaryLight;
  const fg = variant === "outline" ? colors.primary : variant === "secondary" ? colors.primary : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "outline" && { borderWidth: 1.5, borderColor: colors.primary },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.btnText, { color: fg }, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: spacing(1.5) }}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error && { borderColor: colors.danger }, style]}
        {...props}
      />
      {!!error && <Text style={styles.errText}>{error}</Text>}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ text, color = colors.primary, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg || colors.primaryLight }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export function Loading({ text = "Loading..." }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.muted, marginTop: spacing(1) }}>{text}</Text>
    </View>
  );
}

export function Empty({ title, subtitle }) {
  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 40 }}>🛒</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing(1) }} />;
}

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing(2),
  },
  btnText: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 13, color: colors.muted, marginBottom: 6, fontWeight: "600" },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.75),
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.text,
  },
  errText: { color: colors.danger, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    ...shadow,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing(3) },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: spacing(1) },
  emptySub: { color: colors.muted, textAlign: "center", marginTop: 4 },
});
