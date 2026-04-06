import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getUser, saveSession } from "@/src/data/storage/authStorage";
import { sha256 } from "@/src/domain/security/hash";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const onLogin = async () => {
    const user = await getUser();

    if (!user) {
      return Alert.alert("Login", "No hay usuario registrado. Regístrate primero.");
    }

    if (!user.consent) {
      return Alert.alert("Login", "Debe aceptarse el aviso de privacidad.");
    }

    const hash = await sha256(pass);
    const emailNorm = email.trim().toLowerCase();

    if (user.email === emailNorm && user.passwordHash === hash) {
      await saveSession(user.email);
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login", "Credenciales incorrectas.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <ThemedText type="title">Iniciar sesión</ThemedText>
            <ThemedText style={styles.subtitle}>
              Accede al sistema para consultar y gestionar tus auditorías.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Acceso</ThemedText>
            <ThemedText style={styles.helpText}>
              Ingresa tu correo electrónico y contraseña para continuar.
            </ThemedText>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Correo electrónico</ThemedText>
              <TextInput
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Contraseña</ThemedText>
              <TextInput
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={pass}
                onChangeText={setPass}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable onPress={onLogin} style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>Ingresar</ThemedText>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(auth)/register")}
              style={styles.linkButton}
            >
              <ThemedText style={styles.linkText}>Crear cuenta</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    paddingBottom: 40,
    justifyContent: "center",
  },
  headerBlock: {
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  helpText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  fieldBlock: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  actionsBlock: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});