import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "../../components/UI";
import { useAuth } from "../../store/AuthContext";
import { colors, spacing } from "../../theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.name || !form.phone || !form.password) return setError("Name, phone and password are required");
    if (form.password.length < 4) return setError("Password must be at least 4 characters");
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your card</Text>
          <Text style={styles.sub}>You'll get a loyalty card and start earning points on every purchase.</Text>

          <Input label="Full name" value={form.name} onChangeText={set("name")} placeholder="Your name" />
          <Input
            label="Phone number"
            value={form.phone}
            onChangeText={set("phone")}
            keyboardType="phone-pad"
            placeholder="10-digit mobile number"
            autoCapitalize="none"
          />
          <Input
            label="Email (optional)"
            value={form.email}
            onChangeText={set("email")}
            keyboardType="email-address"
            placeholder="you@example.com"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={set("password")}
            secureTextEntry
            placeholder="Choose a password"
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button title="Create account" onPress={submit} loading={loading} />

          <Text style={styles.footer}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => navigation.goBack()}>
              Login
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing(3), paddingTop: spacing(4) },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { color: colors.muted, marginTop: 4, marginBottom: spacing(2) },
  error: { color: colors.danger, marginBottom: spacing(1), fontWeight: "600" },
  footer: { textAlign: "center", marginTop: spacing(2.5), color: colors.muted },
  link: { color: colors.primary, fontWeight: "800" },
});
