import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Divider, Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get, put } from "../../api";
import { colors, radius, spacing, shadow } from "../../theme";

const STATUSES = ["placed", "packed", "out_for_delivery", "delivered", "cancelled"];

export default function AdminOrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      setData(await get(`/api/admin/orders/${orderId}`));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const setStatus = async (status) => {
    setUpdating(true);
    try {
      await put(`/api/admin/orders/${orderId}/status`, { status });
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setUpdating(false);
    }
  };

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
          <Text style={styles.muted}>Customer: {order.user_name} ({order.user_phone})</Text>
          <Text style={styles.muted}>Card: {order.card_number}</Text>
          <Text style={styles.muted}>{order.created_at}</Text>
          {!!order.address && <Text style={styles.muted}>📍 {order.address}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Update status</Text>
          <View style={styles.statusWrap}>
            {STATUSES.map((s) => {
              const active = order.status === s;
              return (
                <Pressable
                  key={s}
                  disabled={updating}
                  onPress={() => setStatus(s)}
                  style={[styles.statusChip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                >
                  <Text style={[styles.statusText, active && { color: colors.white }]}>
                    {s.replace(/_/g, " ")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
              <Text style={styles.itemTotal}>{money(it.price * it.qty)}</Text>
            </View>
          ))}
          <Divider />
          <SumRow label="Subtotal" value={money(order.subtotal)} />
          {order.points_used > 0 && <SumRow label="Points discount" value={`− ${money(order.points_used)}`} />}
          <SumRow label="Total" value={money(order.total)} bold />
          <SumRow label="Points earned" value={`+${order.points_earned}`} highlight />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SumRow({ label, value, bold, highlight }) {
  return (
    <View style={styles.sumRow}>
      <Text style={[styles.muted, bold && { fontWeight: "800", color: colors.text, fontSize: 16 }]}>{label}</Text>
      <Text style={[{ fontWeight: "700", color: colors.text }, bold && { fontSize: 16, fontWeight: "800" }, highlight && { color: colors.success }]}>
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
  statusWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  statusText: { color: colors.text, fontWeight: "600", fontSize: 12, textTransform: "capitalize" },
  itemRow: { flexDirection: "row", paddingVertical: 6 },
  itemName: { fontWeight: "600", color: colors.text },
  itemTotal: { fontWeight: "700", color: colors.text },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
});
