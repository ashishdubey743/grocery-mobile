import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Divider, Input, Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get, put, post } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function AdminUserDetailScreen({ route }) {
  const { userId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsModal, setPointsModal] = useState(null); // { points, note }

  const load = useCallback(async () => {
    try {
      setData(await get(`/api/admin/users/${userId}`));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleActive = async (value) => {
    try {
      await put(`/api/admin/users/${userId}`, { is_active: value ? 1 : 0 });
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const setRole = async (role) => {
    try {
      await put(`/api/admin/users/${userId}`, { role });
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const submitPoints = async () => {
    const pts = parseInt(pointsModal.points, 10);
    if (!pts) return Alert.alert("Missing", "Enter a non-zero number. Use negative to deduct.");
    try {
      await post(`/api/admin/users/${userId}/points`, { points: pts, note: pointsModal.note.trim() || undefined });
      setPointsModal(null);
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  if (loading) return <Loading />;
  if (!data) return <SafeAreaView style={{ flex: 1 }} />;

  const { user, orders, transactions } = data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        <View style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>{user.phone} · {user.email || "no email"}</Text>
          <Text style={styles.meta}>Card {user.card_number} · role {user.role}</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsVal}>⭐ {user.points}</Text>
            <Button
              title="Adjust points"
              variant="secondary"
              style={{ paddingHorizontal: 16, height: 40 }}
              onPress={() => setPointsModal({ points: "", note: "" })}
            />
          </View>
          <Divider />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Account active</Text>
            <Switch value={user.is_active} onValueChange={toggleActive} trackColor={{ true: colors.primary }} />
          </View>
          <View style={styles.roleRow}>
            <Text style={styles.switchLabel}>Role:</Text>
            <Button
              title="Customer"
              variant={user.role === "customer" ? "primary" : "outline"}
              style={{ flex: 1, height: 40 }}
              onPress={() => setRole("customer")}
            />
            <Button
              title="Admin"
              variant={user.role === "admin" ? "primary" : "outline"}
              style={{ flex: 1, height: 40 }}
              onPress={() => setRole("admin")}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Recent orders ({orders.length})</Text>
          {orders.length === 0 && <Text style={styles.meta}>No orders.</Text>}
          {orders.slice(0, 5).map((o) => (
            <View key={o.id} style={styles.txn}>
              <Text style={{ flex: 1, color: colors.text }}>
                #{o.id} · {o.status.replace(/_/g, " ")}
              </Text>
              <Text style={{ fontWeight: "700", color: colors.text }}>{money(o.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Points activity</Text>
          {transactions.length === 0 && <Text style={styles.meta}>No transactions.</Text>}
          {transactions.map((t) => (
            <View key={t.id} style={styles.txn}>
              <Text style={{ flex: 1, color: colors.muted, fontSize: 13 }}>{t.note}</Text>
              <Text style={{ fontWeight: "800", color: t.points > 0 ? colors.success : colors.danger }}>
                {t.points > 0 ? "+" : ""}
                {t.points}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!pointsModal} transparent animationType="fade" onRequestClose={() => setPointsModal(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adjust points</Text>
            <Input
              label="Points (negative to deduct)"
              value={pointsModal?.points}
              onChangeText={(v) => setPointsModal((m) => ({ ...m, points: v }))}
              keyboardType="numbers-and-punctuation"
              placeholder="e.g. 50 or -20"
            />
            <Input
              label="Note (optional)"
              value={pointsModal?.note}
              onChangeText={(v) => setPointsModal((m) => ({ ...m, note: v }))}
              placeholder="Reason"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: spacing(1) }}>
              <Button title="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => setPointsModal(null)} />
              <Button title="Apply" style={{ flex: 1 }} onPress={submitPoints} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  pointsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing(1.5) },
  pointsVal: { fontSize: 20, fontWeight: "800", color: colors.accent },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  switchLabel: { fontWeight: "600", color: colors.text },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing(1) },
  section: { fontWeight: "800", color: colors.text, marginBottom: spacing(1) },
  txn: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing(3) },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing(2.5) },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: spacing(1.5) },
});
