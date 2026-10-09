import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Divider, Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get } from "../../api";
import { colors, radius, spacing, shadow } from "../../theme";

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setData(await get(`/api/orders/${orderId}`));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <Loading />;
  if (!data) return <SafeAreaView style={{ flex: 1 }} />;

  const { order, items } = data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <Badge text={order.status.replace(/_/g, " ")} />
          </View>
          <Text style={styles.muted}>{order.created_at}</Text>
          {!!order.address && <Text style={styles.muted}>📍 {order.address}</Text>}
          {!!order.phone && <Text style={styles.muted}>📞 {order.phone}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Items</Text>
          {items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.name}</Text>
                <Text style={styles.muted}>
                  {money(it.price)} × {it.qty}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.itemTotal}>{money(it.price * it.qty)}</Text>
                <Text style={styles.itemPts}>+{it.points} pts</Text>
              </View>
            </View>
          ))}
          <Divider />
          <Row label="Subtotal" value={money(order.subtotal)} />
          {order.points_used > 0 && <Row label="Points discount" value={`− ${money(order.points_used)}`} highlight />}
          <Row label="Total paid" value={money(order.total)} bold />
          <Row label="Points earned" value={`+${order.points_earned}`} highlight />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <View style={styles.sumRow}>
      <Text style={[styles.muted, bold && { fontWeight: "800", color: colors.text, fontSize: 16 }]}>{label}</Text>
      <Text
        style={[
          { fontWeight: "700", color: colors.text },
          bold && { fontSize: 16, fontWeight: "800" },
          highlight && { color: colors.success },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginBottom: spacing(1.5),
    ...shadow,
  },
  orderId: { fontWeight: "800", fontSize: 16, color: colors.text },
  muted: { color: colors.muted, fontSize: 13, marginTop: 4 },
  section: { fontWeight: "800", marginBottom: spacing(1), color: colors.text },
  itemRow: { flexDirection: "row", paddingVertical: 6 },
  itemName: { fontWeight: "600", color: colors.text },
  itemTotal: { fontWeight: "700", color: colors.text },
  itemPts: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
});
