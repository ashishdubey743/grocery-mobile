import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Badge, Loading } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { get } from "../../api";
import { useCart } from "../../store/CartContext";
import { colors, radius, spacing } from "../../theme";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { items, add, setQty } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await get(`/api/products/${productId}`);
        setProduct(data.product);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) return <Loading />;
  if (!product)
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: spacing(3) }}>
          <Text style={{ color: colors.danger }}>{error || "Product not found"}</Text>
        </View>
      </SafeAreaView>
    );

  const qty = items.find((i) => i.product.id === product.id)?.qty || 0;
  const out = (product.stock || 0) <= 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        <View style={styles.hero}>
          <Text style={{ fontSize: 84 }}>{product.category_icon || "🛒"}</Text>
        </View>
        <View style={styles.info}>
          {!!product.category_name && <Badge text={`${product.category_icon || ""} ${product.category_name}`} />}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.unit}>{product.unit}</Text>
          <Text style={styles.price}>{money(product.price)}</Text>
          <Text style={styles.reward}>
            Earn {product.points_per_100 || 0} points for every ₹100 spent on this item
          </Text>
          {!!product.description && <Text style={styles.desc}>{product.description}</Text>}
          <Text style={[styles.stock, out && { color: colors.danger }]}>
            {out ? "Out of stock" : `In stock: ${product.stock}`}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {qty > 0 ? (
          <View style={styles.qtyRow}>
            <Button title="−" variant="outline" style={styles.qtyBtn} onPress={() => setQty(product.id, qty - 1)} />
            <Text style={styles.qtyText}>{qty}</Text>
            <Button
              title="+"
              variant="outline"
              style={styles.qtyBtn}
              disabled={qty >= product.stock}
              onPress={() => setQty(product.id, qty + 1)}
            />
            <Button
              title="Go to cart"
              style={{ flex: 1, marginLeft: spacing(1) }}
              onPress={() => navigation.navigate("CartTab")}
            />
          </View>
        ) : (
          <Button title={out ? "Out of stock" : "Add to cart"} disabled={out} onPress={() => add(product, 1)} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { padding: spacing(2) },
  name: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: spacing(1.5) },
  unit: { color: colors.muted, marginTop: 2 },
  price: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: spacing(1) },
  reward: { color: colors.accent, fontWeight: "700", marginTop: 6, fontSize: 13 },
  desc: { color: colors.muted, marginTop: spacing(1.5), lineHeight: 20 },
  stock: { marginTop: spacing(1.5), fontWeight: "700", color: colors.primary },
  footer: { padding: spacing(2), borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBtn: { width: 54, marginHorizontal: 4 },
  qtyText: { fontSize: 18, fontWeight: "800", minWidth: 32, textAlign: "center" },
});
