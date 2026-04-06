import { router, useLocalSearchParams } from "expo-router";
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

import { addChecklistItem } from "@/src/data/storage/checklistStorage";
import { ChecklistItem } from "@/src/domain/models/ChecklistItem";

export default function NuevoChecklistItem() {
  const { auditoriaId } = useLocalSearchParams<{ auditoriaId: string }>();

  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const onSave = async () => {
    if (!descripcion.trim()) {
      return Alert.alert("Validación", "Debe escribir la descripción del punto.");
    }

    const item: ChecklistItem = {
      id: Date.now().toString(),
      auditoriaId: auditoriaId!,
      descripcion: descripcion.trim(),
      estatus: "Pendiente",
      observaciones: observaciones.trim(),
      createdAt: new Date().toISOString(),
    };

    await addChecklistItem(item);
    Alert.alert("Éxito", "Punto agregado correctamente.");
    router.back();
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
            <ThemedText type="title">Nuevo punto de auditoría</ThemedText>
            <ThemedText style={styles.subtitle}>
              Agrega un nuevo punto de verificación para el checklist de esta auditoría.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Información del punto</ThemedText>
            <ThemedText style={styles.helpText}>
              El punto se registrará inicialmente con estatus Pendiente para que
              pueda revisarse después durante la auditoría.
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Descripción</ThemedText>
              <TextInput
                placeholder="Describe el punto de verificación"
                placeholderTextColor="#9CA3AF"
                value={descripcion}
                onChangeText={setDescripcion}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Observaciones</ThemedText>
              <TextInput
                placeholder="Observaciones adicionales"
                placeholderTextColor="#9CA3AF"
                value={observaciones}
                onChangeText={setObservaciones}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable style={styles.primaryButton} onPress={onSave}>
              <ThemedText style={styles.primaryButtonText}>Guardar punto</ThemedText>
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
  infoCard: {
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
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
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
});