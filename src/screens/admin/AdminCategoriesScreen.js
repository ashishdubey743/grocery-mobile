import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, Loading } from "../../components/UI";
import { get, post, put, del } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(null); // { id?, name, icon, points_per_100 }
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get("/api/admin/categories");
      setCategories(data.categories);
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

  const openNew = () => setModal({ name: "", icon: "", points_per_100: "1" });
  const openEdit = (c) => setModal({ id: c.id, name: c.name, icon: c.icon || "", points_per_100: String(c.points_per_100) });

  const save = async () => {
    if (!modal.name) return Alert.alert("Missing", "Enter a category name.");
    setSaving(true);
    const payload = {
      name: modal.name.trim(),
      icon: modal.icon.trim() || null,
      points_per_100: parseInt(modal.points_per_100, 10) || 0,
    };
    try {
      if (modal.id) await put(`/api/admin/categories/${modal.id}`, payload);
      else await post("/api/admin/categories", payload);
      setModal(null);
      await load();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c) => {
    try {
      await put(`/api/admin/categories/${c.id}`, { is_active: c.is_active ? 0 : 1 });
      load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const remove = (c) => {
    Alert.alert("Delete category", `Delete "${c.name}"? If it has products it will be hidden instead.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await del(`/api/admin/categories/${c.id}`);
          load();
        },
      },
    ]);
  };

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <View style={styles.bar}>
        <Text style={styles.hint}>Points given per ₹100 spent in each category.</Text>
        <Pressable style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <Text style={styles.name}>
                {item.icon || "🏷️"} {item.name}
              </Text>
              <Text style={styles.meta}>
                {item.points_per_100} points / ₹100 · {item.is_active ? "active" : "hidden"}
              </Text>
            </Pressable>
            <Pressable style={styles.toggleBtn} onPress={() => toggle(item)}>
              <Text style={styles.toggleText}>{item.is_active ? "Hide" : "Show"}</Text>
            </Pressable>
            <Pressable style={styles.delBtn} onPress={() => remove(item)}>
              <Text style={styles.delText}>Del</Text>
            </Pressable>
          </View>
        )}
      />

      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modal?.id ? "Edit category" : "New category"}</Text>
            <Input
              label="Name"
              value={modal?.name}
              onChangeText={(v) => setModal((m) => ({ ...m, name: v }))}
              placeholder="e.g. Biscuits"
            />
            <Input
              label="Icon (emoji)"
              value={modal?.icon}
              onChangeText={(v) => setModal((m) => ({ ...m, icon: v }))}
              placeholder="🍪"
            />
            <Input
              label="Points per ₹100"
              value={modal?.points_per_100}
              onChangeText={(v) => setModal((m) => ({ ...m, points_per_100: v }))}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: spacing(1) }}>
              <Button title="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => setModal(null)} />
              <Button title="Save" style={{ flex: 1 }} loading={saving} onPress={save} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", padding: spacing(2), gap: 8 },
  hint: { flex: 1, color: colors.muted, fontSize: 12 },
  addBtn: { backgroundColor: colors.primary, height: 42, paddingHorizontal: 16, borderRadius: radius.md, justifyContent: "center" },
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
  name: { fontWeight: "700", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.primaryLight, marginRight: 6 },
  toggleText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  delBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: "#FEE2E2" },
  delText: { color: colors.danger, fontWeight: "700", fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing(3) },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing(2.5) },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: spacing(1.5) },
});
