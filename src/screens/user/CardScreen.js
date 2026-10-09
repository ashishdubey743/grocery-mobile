import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Empty, Loading } from "../../components/UI";
import { get } from "../../api";
import { useAuth } from "../../store/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function CardScreen() {
  const { user, refresh } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get("/api/points");
      setTxns(data.transactions);
      await refresh();
    } catch (e) {
      // ignore
    }
  }, [refresh]);

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

  const earned = txns.filter((t) => t.points > 0).reduce((s, t) => s + t.points, 0);
  const used = txns.filter((t) => t.points < 0).reduce((s, t) => s + Math.abs(t.points), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <FlatList
        data={txns}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>My Points Card</Text>
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.storeName}>🛒 Grocery Store</Text>
                <Text style={styles.cardLabel}>LOYALTY CARD</Text>
              </View>
              <Text style={styles.cardNumber}>{user?.card_number || "GC------"}</Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardHolderLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardHolder}>{user?.name || "-"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cardHolderLabel}>POINTS</Text>
                  <Text style={styles.pointsBig}>⭐ {user?.points ?? 0}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Stat label="Earned" value={`+${earned}`} color={colors.success} />
              <Stat label="Used" value={`−${used}`} color={colors.danger} />
              <Stat label="Balance" value={`${user?.points ?? 0}`} color={colors.primary} />
            </View>

            <Text style={styles.sectionTitle}>History</Text>
          </>
        }
        ListEmptyComponent={<Empty title="No activity yet" subtitle="Earn points by shopping at the store." />}
        renderItem={({ item }) => (
          <View style={styles.txn}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txnNote}>{item.note || (item.points > 0 ? "Points earned" : "Points used")}</Text>
              <Text style={styles.txnDate}>{item.created_at}</Text>
            </View>
            <Text style={[styles.txnPts, { color: item.points > 0 ? colors.success : colors.danger }]}>
              {item.points > 0 ? "+" : ""}
              {item.points}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: spacing(1.5) },
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    ...shadow,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  storeName: { color: colors.white, fontWeight: "800", fontSize: 16 },
  cardLabel: { color: "#BFE3CC", fontSize: 10, letterSpacing: 1.5, fontWeight: "700" },
  cardNumber: { color: colors.white, fontSize: 22, fontWeight: "800", letterSpacing: 3, marginVertical: spacing(2.5) },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardHolderLabel: { color: "#BFE3CC", fontSize: 10, letterSpacing: 1, fontWeight: "700" },
  cardHolder: { color: colors.white, fontWeight: "700", fontSize: 15, marginTop: 2 },
  pointsBig: { color: colors.accent, fontWeight: "800", fontSize: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: spacing(1.5) },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.5),
    alignItems: "center",
    ...shadow,
  },
  statValue: { fontWeight: "800", fontSize: 18 },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: spacing(3), marginBottom: spacing(1) },
  txn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.75),
    marginBottom: spacing(1),
  },
  txnNote: { fontWeight: "600", color: colors.text },
  txnDate: { color: colors.muted, fontSize: 12, marginTop: 2 },
  txnPts: { fontWeight: "800", fontSize: 16 },
});
