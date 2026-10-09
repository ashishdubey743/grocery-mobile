import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Empty, Input } from "../../components/UI";
import { money } from "../../components/ProductCard";
import { post } from "../../api";
import { useCart } from "../../store/CartContext";
import { useAuth } from "../../store/AuthContext";
import { colors, radius, spacing, shadow } from "../../theme";

export default function CartScreen({ navigation }) {
  const { items, setQty, remove, subtotal, clear, count } = useCart();
  const { user, refresh } = useAuth();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [usePoints, setUsePoints] = useState(false);
  const [placing, setPlacing] = useState(false);

  const maxRedeemable = Math.min(user?.points || 0, Math.floor(subtotal));
  const redeem = usePoints ? maxRedeemable : 0;
  const total = Math.max(0, subtotal - redeem);

  const placeOrder = async () => {
    if (!address.trim()) return Alert.alert("Address needed", "Please enter a delivery address.");
    setPlacing(true);
    try {
      const data = await post("/api/orders", {
        items: items.map((i) => ({ product_id: i.product.id, qty: i.qty })),
        address: address.trim(),
        phone: phone.trim(),
        redeem_points: redeem,
      });
      clear();
      await refresh();
      Alert.alert("Order placed 🎉", `Order #${data.order.id} · You earned ${data.order.points_earned} points.`, [
        { text: "View orders", onPress: () => navigation.navigate("OrdersTab") },
        { text: "Keep shopping", onPress: () => navigation.navigate("ShopTab") },
      ]);
    } catch (e) {
      Alert.alert("Order failed", e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (count === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <Empty title="Your cart is empty" subtitle="Add items from the shop to get started." />
        <View style={{ padding: spacing(3) }}>
          <Button title="Browse products" onPress={() => navigation.navigate("ShopTab")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <Text style={styles.title}>My Cart ({count})</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.product.id)}
        contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(4) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.emoji}>{item.product.category_icon || "🛒"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.unit}>
                {item.product.unit} · {money(item.product.price)}
              </Text>
              <Text style={styles.lineTotal}>{money(item.product.price * item.qty)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <Pressable style={styles.qtyBtn} onPress={() => setQty(item.product.id, item.qty - 1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{item.qty}</Text>
              <Pressable
                style={styles.qtyBtn}
                disabled={item.qty >= item.product.stock}
                onPress={() => setQty(item.product.id, item.qty + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Subtotal</Text>
          <Text style={styles.sumValue}>{money(subtotal)}</Text>
        </View>

        {(user?.points || 0) > 0 && (
          <View style={styles.redeemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sumLabel}>Use {maxRedeemable} points</Text>
              <Text style={styles.redeemHint}>You have {user.points} points (₹1 each)</Text>
            </View>
            <Switch value={usePoints} onValueChange={setUsePoints} trackColor={{ true: colors.primary }} />
          </View>
        )}

        {!!redeem && (
          <View style={styles.sumRow}>
            <Text style={[styles.sumLabel, { color: colors.success }]}>Points discount</Text>
            <Text style={[styles.sumValue, { color: colors.success }]}>− {money(redeem)}</Text>
          </View>
        )}

        <Input label="Delivery phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ height: 44 }} />
        <Text style={styles.sumLabel}>Delivery address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="House / street / area"
          placeholderTextColor={colors.muted}
          multiline
          style={styles.address}
        />

        <View style={[styles.sumRow, { marginTop: spacing(1) }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>

        <Button title="Place order" onPress={placeOrder} loading={placing} style={{ marginTop: spacing(1) }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: colors.text, padding: spacing(2) },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    marginBottom: spacing(1.25),
    ...shadow,
  },
  emoji: { fontSize: 30, marginRight: spacing(1.5) },
  name: { fontWeight: "700", color: colors.text },
  unit: { color: colors.muted, fontSize: 12, marginTop: 2 },
  lineTotal: { fontWeight: "800", marginTop: 4, color: colors.text },
  qtyBox: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { color: colors.primary, fontSize: 20, fontWeight: "800", lineHeight: 22 },
  qty: { minWidth: 32, textAlign: "center", fontWeight: "800" },
  summary: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing(2),
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  sumLabel: { color: colors.muted, fontWeight: "600" },
  sumValue: { fontWeight: "700", color: colors.text },
  redeemRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  redeemHint: { fontSize: 11, color: colors.muted },
  address: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(1.5),
    marginTop: 6,
    marginBottom: spacing(1),
    textAlignVertical: "top",
    color: colors.text,
  },
  totalLabel: { fontSize: 18, fontWeight: "800", color: colors.text },
  totalValue: { fontSize: 20, fontWeight: "800", color: colors.primary },
});
