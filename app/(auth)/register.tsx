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
import { saveUser } from "@/src/data/storage/authStorage";
import { sha256 } from "@/src/domain/security/hash";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [consent, setConsent] = useState(false);

  const validate = () => {
    if (!name.trim()) return "El nombre es obligatorio.";
    if (!email.includes("@")) return "Correo no válido.";
    if (pass.length < 6) return "La contraseña debe tener mínimo 6 caracteres.";
    if (!consent) return "Debe aceptar el aviso de privacidad para continuar.";
    return null;
  };

  const onRegister = async () => {
    const err = validate();
    if (err) return Alert.alert("Validación", err);

    const passwordHash = await sha256(pass);

    await saveUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      consent: true,
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Registro exitoso", "Ahora puedes iniciar sesión.");
    router.replace("/(auth)/login");
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
            <ThemedText type="title">Registro</ThemedText>
            <ThemedText style={styles.subtitle}>
              Crea tu cuenta para acceder al sistema de auditorías.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Datos de acceso</ThemedText>
            <ThemedText style={styles.helpText}>
              Completa la información requerida y acepta el aviso de privacidad para continuar.
            </ThemedText>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Nombre</ThemedText>
              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={pass}
                onChangeText={setPass}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle">Privacidad y consentimiento</ThemedText>

            <Pressable
              onPress={() => router.push("/(auth)/privacy")}
              style={styles.linkButton}
            >
              <ThemedText style={styles.linkText}>Ver Aviso de Privacidad</ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setConsent(!consent)}
              style={[styles.consentBox, consent && styles.consentBoxSelected]}
            >
              <View style={styles.consentTextBlock}>
                <ThemedText style={styles.consentTitle}>
                  Acepto el Aviso de Privacidad
                </ThemedText>
                <ThemedText style={styles.consentHelp}>
                  Debes aceptar este consentimiento para crear tu cuenta.
                </ThemedText>
              </View>

              <View style={[styles.checkbox, consent && styles.checkboxSelected]}>
                <ThemedText style={styles.checkboxText}>
                  {consent ? "✓" : ""}
                </ThemedText>
              </View>
            </Pressable>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable onPress={onRegister} style={styles.primaryButton}>
              <ThemedText style={styles.primaryButtonText}>Crear cuenta</ThemedText>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              style={styles.linkButton}
            >
              <ThemedText style={styles.linkText}>
                ¿Ya tienes cuenta? Inicia sesión
              </ThemedText>
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
  sectionCard: {
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
  consentBox: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  consentBoxSelected: {
    backgroundColor: "#F3F4F6",
  },
  consentTextBlock: {
    flex: 1,
    gap: 4,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  consentHelp: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
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