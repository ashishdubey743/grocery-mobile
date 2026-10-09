import React, { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Empty, Loading, Badge } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

const STATUS_COLORS = {
  placed: { color: "#B45309", bg: "#FEF3C7" },
  packed: { color: "#1D4ED8", bg: "#DBEAFE" },
  out_for_delivery: { color: "#6D28D9", bg: "#EDE9FE" },
  delivered: { color: colors.primary, bg: colors.primaryLight },
  cancelled: { color: colors.danger, bg: "#FEE2E2" },
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get("/api/orders");
      setOrders(data.orders);
    } catch (e) {
      // ignore, list stays
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Empty title="No orders yet" subtitle="Your placed orders will appear here." />}
        renderItem={({ item }) => {
          const sc = STATUS_COLORS[item.status] || STATUS_COLORS.placed;
          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Badge text={item.status.replace(/_/g, " ")} color={sc.color} bg={sc.bg} />
              </View>
              <Text style={styles.date}>{item.created_at}</Text>
              <View style={styles.footer}>
                <Text style={styles.total}>{money(item.total)}</Text>
                <Text style={styles.points}>+{item.points_earned} pts</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.text, padding: spacing(2) },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginBottom: spacing(1.5),
    ...shadow,
  },
  orderId: { fontWeight: "800", color: colors.text, fontSize: 15 },
  date: { color: colors.muted, fontSize: 12, marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing(1), alignItems: "center" },
  total: { fontWeight: "800", fontSize: 16, color: colors.text },
  points: { color: colors.accent, fontWeight: "800" },
});
