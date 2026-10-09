import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Empty, Input, Loading } from "../../components/UI";
import { get, post } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get("/api/admin/users");
      setUsers(data.users);
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

  const save = async () => {
    if (!modal.name || !modal.phone || !modal.password) return Alert.alert("Missing", "Name, phone and password required.");
    setSaving(true);
    try {
      await post("/api/admin/users", {
        name: modal.name.trim(),
        phone: modal.phone.trim(),
        email: modal.email.trim() || null,
        password: modal.password,
        role: modal.role,
      });
      setModal(null);
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(search) ||
      (u.card_number || "").toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <View style={styles.bar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, phone or card"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <Pressable style={styles.addBtn} onPress={() => setModal({ name: "", phone: "", email: "", password: "", role: "customer" })}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Empty title="No customers" />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate("AdminUserDetail", { userId: item.id })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.name} {item.role === "admin" ? "· ADMIN" : ""} {item.is_active ? "" : "· disabled"}
              </Text>
              <Text style={styles.meta}>
                {item.phone} · {item.card_number}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.points}>⭐ {item.points}</Text>
            </View>
          </Pressable>
        )}
      />

      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add customer / admin</Text>
            <Input label="Name" value={modal?.name} onChangeText={(v) => setModal((m) => ({ ...m, name: v }))} />
            <Input
              label="Phone"
              value={modal?.phone}
              onChangeText={(v) => setModal((m) => ({ ...m, phone: v }))}
              keyboardType="phone-pad"
            />
            <Input
              label="Email (optional)"
              value={modal?.email}
              onChangeText={(v) => setModal((m) => ({ ...m, email: v }))}
              autoCapitalize="none"
            />
            <Input
              label="Password"
              value={modal?.password}
              onChangeText={(v) => setModal((m) => ({ ...m, password: v }))}
              secureTextEntry
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: spacing(0.5) }}>
              <Button
                title="Customer"
                variant={modal?.role === "customer" ? "primary" : "outline"}
                style={{ flex: 1 }}
                onPress={() => setModal((m) => ({ ...m, role: "customer" }))}
              />
              <Button
                title="Admin"
                variant={modal?.role === "admin" ? "primary" : "outline"}
                style={{ flex: 1 }}
                onPress={() => setModal((m) => ({ ...m, role: "admin" }))}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: spacing(2) }}>
              <Button title="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => setModal(null)} />
              <Button title="Create" style={{ flex: 1 }} loading={saving} onPress={save} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", padding: spacing(2), gap: 8, alignItems: "center" },
  search: {
    flex: 1,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.75),
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: { backgroundColor: colors.primary, height: 46, paddingHorizontal: 18, borderRadius: radius.md, justifyContent: "center" },
  addText: { color: colors.white, fontWeight: "800" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(1.75),
    marginBottom: spacing(1.25),
    ...shadow,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing(1.5),
  },
  avatarText: { color: colors.primary, fontWeight: "800", fontSize: 18 },
  name: { fontWeight: "700", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  points: { color: colors.accent, fontWeight: "800" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing(2.5) },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing(2.5) },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: spacing(1.5) },
});
