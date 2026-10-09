import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, shadow } from "../theme";

export function formatMoney(n) {
  return `₹${Number(n || 0).toFixed(2).replace(/\.00$/, "")}`;
}

export default function ProductCard({ product, onPress, onAdd, qty = 0 }) {
  const out = (product.stock || 0) <= 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.thumb}>
        <Text style={styles.thumbText}>{product.category_icon || "🛒"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
          {product.points_per_100 ? (
            <Text style={styles.pts}>+{product.points_per_100} pts/₹100</Text>
          ) : null}
        </View>
        {out ? (
          <Text style={styles.out}>Out of stock</Text>
        ) : (
          <View style={styles.row}>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onAdd} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}>
              <Text style={styles.addText}>{qty > 0 ? `In cart · ${qty}` : "ADD"}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(1.5),
    ...shadow,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing(1.5),
  },
  thumbText: { fontSize: 34 },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  unit: { fontSize: 12, color: colors.muted, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  price: { fontSize: 16, fontWeight: "800", color: colors.text },
  pts: { fontSize: 11, color: colors.accent, fontWeight: "700", marginLeft: 8 },
  out: { color: colors.danger, fontWeight: "700", fontSize: 12, marginTop: 6 },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  addText: { color: colors.white, fontWeight: "800", fontSize: 12 },
});

export { formatMoney as money };
