import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function AdminHomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setStats(await get("/api/admin/stats"));
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

  const links = [
    { key: "AdminProducts", title: "Products", icon: "📦", desc: `${stats?.products ?? 0} items` },
    { key: "AdminCategories", title: "Categories & Points", icon: "🏷️", desc: "Set points per category" },
    { key: "AdminOrders", title: "Orders", icon: "🧾", desc: `${stats?.orders ?? 0} orders · ${stats?.pending ?? 0} new` },
    { key: "AdminUsers", title: "Customers", icon: "👥", desc: `${stats?.users ?? 0} customers` },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.grid}>
          <StatCard label="Revenue" value={money(stats?.revenue || 0)} icon="💰" />
          <StatCard label="Orders" value={String(stats?.orders || 0)} icon="🧾" />
          <StatCard label="Customers" value={String(stats?.users || 0)} icon="👥" />
          <StatCard label="Points issued" value={String(stats?.pointsIssued || 0)} icon="⭐" />
        </View>

        {(stats?.pending || 0) > 0 && (
          <View style={styles.alert}>
            <Text style={styles.alertText}>🔔 {stats.pending} new order(s) waiting to be processed</Text>
          </View>
        )}

        <View style={{ marginTop: spacing(1) }}>
          {links.map((l) => (
            <Pressable
              key={l.key}
              style={({ pressed }) => [styles.link, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate(l.key)}
            >
              <View style={styles.linkInner}>
                <Text style={styles.linkIcon}>{l.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkTitle}>{l.title}</Text>
                  <Text style={styles.linkDesc}>{l.desc}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {stats?.lowStock?.length > 0 && (
          <View style={styles.lowStock}>
            <Text style={styles.lowTitle}>⚠️ Low stock</Text>
            {stats.lowStock.map((p) => (
              <View key={p.id} style={styles.lowRow}>
                <Text style={{ flex: 1, color: colors.text }}>{p.name}</Text>
                <Text style={{ color: colors.danger, fontWeight: "800" }}>{p.stock} left</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: spacing(2) },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    ...shadow,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 6 },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  alert: {
    backgroundColor: "#FEF3C7",
    borderRadius: radius.md,
    padding: spacing(1.5),
    marginTop: spacing(2),
  },
  alertText: { color: "#92400E", fontWeight: "700" },
  link: { marginTop: spacing(1.5) },
  linkInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    ...shadow,
  },
  linkIcon: { fontSize: 24, marginRight: spacing(1.5) },
  linkTitle: { fontWeight: "800", color: colors.text, fontSize: 16 },
  linkDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  chev: { fontSize: 26, color: colors.muted },
  lowStock: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginTop: spacing(2),
    ...shadow,
  },
  lowTitle: { fontWeight: "800", color: colors.text, marginBottom: spacing(1) },
  lowRow: { flexDirection: "row", paddingVertical: 4 },
});
