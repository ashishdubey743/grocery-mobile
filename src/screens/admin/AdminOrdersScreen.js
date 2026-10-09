import React, { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Empty, Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

const FILTERS = ["all", "placed", "packed", "out_for_delivery", "delivered", "cancelled"];

export default function AdminOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get("/api/admin/orders");
      setOrders(data.orders);
    } catch (e) {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await load();
        setLoading(false);
      })();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Loading />;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 48, paddingHorizontal: spacing(2) }}
        contentContainerStyle={{ gap: 8, alignItems: "center" }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[styles.chipText, filter === f && { color: colors.white }]}>{f.replace(/_/g, " ")}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Empty title="No orders" subtitle="Orders placed by customers appear here." />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("AdminOrderDetail", { orderId: item.id })}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.orderId}>#{item.id} · {item.user_name}</Text>
              <Badge text={item.status.replace(/_/g, " ")} />
            </View>
            <Text style={styles.meta}>{item.user_phone} · {item.created_at}</Text>
            <View style={styles.footer}>
              <Text style={styles.total}>{money(item.total)}</Text>
              <Text style={styles.pts}>+{item.points_earned} pts</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 12, textTransform: "capitalize" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginBottom: spacing(1.5),
    ...shadow,
  },
  orderId: { fontWeight: "800", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing(1) },
  total: { fontWeight: "800", color: colors.text },
  pts: { color: colors.accent, fontWeight: "800" },
});
