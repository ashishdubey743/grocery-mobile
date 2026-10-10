import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import { Empty, Loading } from "../../components/UI";
import { get } from "../../api";
import { useCart } from "../../store/CartContext";
import { useAuth } from "../../store/AuthContext";
import { colors, radius, spacing } from "../../theme";

export default function ShopScreen({ navigation }) {
  const { user } = useAuth();
  const { items, add, count } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [c, p] = await Promise.all([get("/api/categories"), get("/api/products")]);
      setCategories(c.categories);
      setProducts(p.products);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const qtyFor = (id) => items.find((i) => i.product.id === id)?.qty || 0;

  const filtered = products.filter((p) => {
    if (activeCat && p.category_id !== activeCat) return false;
    if (search && !`${p.name} ${p.brand || ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Loading text="Loading store..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hello, {user?.name?.split(" ")[0] || "there"} 👋</Text>
          <Text style={styles.sub}>What do you need today?</Text>
        </View>
        <View style={styles.ptsPill}>
          <Text style={styles.ptsPillText}>⭐ {user?.points ?? 0}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search flour, tea, chips..."
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={{ paddingHorizontal: spacing(2), gap: 8 }}
      >
        <Chip label="All" active={activeCat === null} onPress={() => setActiveCat(null)} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={`${c.icon || ""} ${c.name}`}
            active={activeCat === c.id}
            onPress={() => setActiveCat(c.id)}
          />
        ))}
      </ScrollView>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(12) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            qty={qtyFor(item.id)}
            onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
            onAdd={() => add(item, 1)}
          />
        )}
        ListEmptyComponent={<Empty title="No products found" subtitle="Try a different search or category." />}
      />

      {count > 0 && (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate("CartTab")}>
          <Text style={styles.cartBarText}>
            {count} item{count > 1 ? "s" : ""} in cart
          </Text>
          <Text style={styles.cartBarText}>View cart →</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing(2),
    paddingTop: spacing(1),
  },
  hello: { fontSize: 20, fontWeight: "800", color: colors.text },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  ptsPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  ptsPillText: { color: colors.primary, fontWeight: "800" },
  searchWrap: { paddingHorizontal: spacing(2), marginTop: spacing(1.5) },
  chipsRow: { maxHeight: 60, marginTop: spacing(1), marginBottom: spacing(0.5) },
  search: {
    height: 48,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  error: { color: colors.danger, paddingHorizontal: spacing(2), marginTop: spacing(1) },
  cartBar: {
    position: "absolute",
    left: spacing(2),
    right: spacing(2),
    bottom: spacing(2),
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(2.5),
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartBarText: { color: colors.white, fontWeight: "800", fontSize: 15 },
});
