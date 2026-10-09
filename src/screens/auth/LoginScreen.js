import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { colors, spacing } from "../../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!phone || !password) return setError("Enter phone and password");
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Text style={{ fontSize: 48 }}>🛒</Text>
          </View>
          <Text style={styles.brand}>Grocery Store</Text>
          <Text style={styles.tag}>Shop daily needs & earn reward points</Text>

          <View style={{ height: spacing(3) }} />
          <Input
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button title="Login" onPress={submit} loading={loading} style={{ marginTop: spacing(1) }} />

          <Text style={styles.footer}>
            New customer?{" "}
            <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
              Create an account
            </Text>
          </Text>
          <Text style={styles.hint}>Admin login uses the same screen.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(3), paddingTop: spacing(6), flexGrow: 1 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  brand: { fontSize: 26, fontWeight: "800", textAlign: "center", color: colors.text, marginTop: spacing(1.5) },
  tag: { textAlign: "center", color: colors.muted, marginTop: 4 },
  error: { color: colors.danger, marginBottom: spacing(1), fontWeight: "600" },
  footer: { textAlign: "center", marginTop: spacing(3), color: colors.muted },
  link: { color: colors.primary, fontWeight: "800" },
  hint: { textAlign: "center", color: colors.muted, fontSize: 12, marginTop: spacing(1) },
});
