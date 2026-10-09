import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Input } from "../../components/UI";
import { post } from "../../api";
import { useAuth } from "../../store/AuthContext";
import { colors, spacing } from "../../theme";

export default function ProfileScreen({ navigation }) {
  const { user, isAdmin, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changing, setChanging] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      Alert.alert("Saved", "Profile updated.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!oldPw || !newPw) return Alert.alert("Missing", "Enter current and new password.");
    setChanging(true);
    try {
      await post("/api/auth/change-password", { old_password: oldPw, new_password: newPw });
      setOldPw("");
      setNewPw("");
      Alert.alert("Done", "Password changed.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setChanging(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 30 }}>{(user?.name || "?").charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.phone}</Text>
          {isAdmin && <Text style={styles.adminTag}>ADMIN</Text>}
          <Text style={styles.points}>⭐ {user?.points ?? 0} points · {user?.card_number}</Text>
        </View>

        {isAdmin && (
          <Button
            title="Open Admin Panel"
            variant="secondary"
            style={{ marginBottom: spacing(2) }}
            onPress={() => navigation.navigate("AdminTab")}
          />
        )}

        <Card style={{ marginBottom: spacing(2) }}>
          <Text style={styles.section}>Edit profile</Text>
          <Input label="Name" value={name} onChangeText={setName} />
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button title="Save changes" onPress={save} loading={saving} />
        </Card>

        <Card style={{ marginBottom: spacing(2) }}>
          <Text style={styles.section}>Change password</Text>
          <Input label="Current password" value={oldPw} onChangeText={setOldPw} secureTextEntry />
          <Input label="New password" value={newPw} onChangeText={setNewPw} secureTextEntry />
          <Button title="Change password" variant="secondary" onPress={changePassword} loading={changing} />
        </Card>

        <Button title="Logout" variant="danger" onPress={confirmLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: "center", marginBottom: spacing(2.5) },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: spacing(1) },
  meta: { color: colors.muted },
  adminTag: {
    marginTop: 6,
    backgroundColor: colors.accent,
    color: colors.white,
    fontWeight: "800",
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  points: { color: colors.primary, fontWeight: "700", marginTop: 6 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: spacing(1.5) },
});
