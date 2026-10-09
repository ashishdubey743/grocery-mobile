import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "../../components/UI";
import { get, post, put } from "../../api";
import { colors, radius, spacing } from "../../theme";

export default function AdminProductFormScreen({ route, navigation }) {
  const editing = route.params?.product;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: editing?.name || "",
    category_id: editing?.category_id || null,
    brand: editing?.brand || "",
    unit: editing?.unit || "1 pc",
    price: editing?.price != null ? String(editing.price) : "",
    stock: editing?.stock != null ? String(editing.stock) : "",
    image: editing?.image || "",
    description: editing?.description || "",
    is_active: editing ? !!editing.is_active : true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await get("/api/admin/categories");
        setCategories(data.categories);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? "Edit Product" : "Add Product" });
  }, [navigation, editing]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.price) return Alert.alert("Missing", "Name and price are required.");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category_id: form.category_id,
      brand: form.brand.trim() || null,
      unit: form.unit.trim() || "1 pc",
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock, 10) || 0,
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (editing) await put(`/api/admin/products/${editing.id}`, payload);
      else await post("/api/admin/products", payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }} keyboardShouldPersistTaps="handled">
        <Input label="Product name" value={form.name} onChangeText={set("name")} placeholder="e.g. Tata Tea Gold" />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {categories.map((c) => {
            const active = form.category_id === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => set("category_id")(c.id)}
                style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={[styles.chipText, active && { color: colors.white }]}>
                  {c.icon || ""} {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input label="Brand (optional)" value={form.brand} onChangeText={set("brand")} placeholder="Brand name" />
        <Input label="Unit / pack size" value={form.unit} onChangeText={set("unit")} placeholder="e.g. 500 g, 1 L" />
        <Input
          label="Price (₹)"
          value={form.price}
          onChangeText={set("price")}
          keyboardType="numeric"
          placeholder="0"
        />
        <Input
          label="Stock quantity"
          value={form.stock}
          onChangeText={set("stock")}
          keyboardType="numeric"
          placeholder="0"
        />
        <Input
          label="Image URL (optional)"
          value={form.image}
          onChangeText={set("image")}
          placeholder="https://..."
          autoCapitalize="none"
        />
        <Input
          label="Description (optional)"
          value={form.description}
          onChangeText={set("description")}
          placeholder="Short description"
          multiline
          style={{ height: 80, textAlignVertical: "top", paddingTop: 12 }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Available in store</Text>
          <Switch
            value={form.is_active}
            onValueChange={set("is_active")}
            trackColor={{ true: colors.primary }}
          />
        </View>

        <Button title={editing ? "Save changes" : "Add product"} onPress={save} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.muted, marginBottom: 6, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing(2) },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing(2),
    marginBottom: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLabel: { fontWeight: "600", color: colors.text },
});
