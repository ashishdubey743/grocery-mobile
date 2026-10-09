import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Empty, Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get, del } from "../../api";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function AdminProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get("/api/admin/products");
      setProducts(data.products);
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

  const remove = (p) => {
    Alert.alert("Remove product", `Remove "${p.name}" from the store?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await del(`/api/admin/products/${p.id}`);
          load();
        },
      },
    ]);
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <View style={styles.bar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate("AdminProductForm", {})}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Empty title="No products" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.name} {item.is_active ? "" : "(hidden)"}
              </Text>
              <Text style={styles.meta}>
                {item.category_name || "Uncategorized"} · {item.unit}
              </Text>
              <Text style={styles.meta}>
                {money(item.price)} · stock {item.stock}
              </Text>
            </View>
            <Pressable
              style={styles.editBtn}
              onPress={() => navigation.navigate("AdminProductForm", { product: item })}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.delBtn} onPress={() => remove(item)}>
              <Text style={styles.delText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
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
  name: { fontWeight: "700", color: colors.text },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.primaryLight, marginRight: 6 },
  editText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  delBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: "#FEE2E2" },
  delText: { color: colors.danger, fontWeight: "700", fontSize: 12 },
});
