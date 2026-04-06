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
import {
  addAuditoria,
  generateAuditoriaFolio,
} from "@/src/data/storage/auditoriasStorage";
import { getCurrentUser } from "@/src/data/storage/authStorage";
import { Auditoria } from "@/src/domain/models/Auditoria";

function getStatusColor(estatus: Auditoria["estatus"]) {
  switch (estatus) {
    case "Pendiente":
      return "#9CA3AF";
    case "En proceso":
      return "#F59E0B";
    case "Finalizada":
      return "#10B981";
    default:
      return "#9CA3AF";
  }
}

export default function NuevaAuditoriaScreen() {
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estatus, setEstatus] = useState<Auditoria["estatus"]>("Pendiente");

  const onSave = async () => {
    if (titulo.trim().length < 3) {
      return Alert.alert("Validación", "El título debe tener al menos 3 caracteres.");
    }

    if (!area.trim()) {
      return Alert.alert("Validación", "El área es obligatoria.");
    }

    if (descripcion.trim().length < 10) {
      return Alert.alert("Validación", "La descripción debe tener al menos 10 caracteres.");
    }

    if (!fecha.trim()) {
      return Alert.alert("Validación", "La fecha es obligatoria.");
    }

    const user = await getCurrentUser();
    const folio = await generateAuditoriaFolio();

    const nuevaAuditoria: Auditoria = {
      id: Date.now().toString(),
      folio,
      titulo: titulo.trim(),
      area: area.trim(),
      descripcion: descripcion.trim(),
      fecha: fecha.trim(),
      responsable: user?.name || user?.email || "Usuario",
      estatus,
      observaciones: observaciones.trim(),
      createdAt: new Date().toISOString(),
    };

    await addAuditoria(nuevaAuditoria);

    Alert.alert("Éxito", "Auditoría registrada correctamente.");
    router.replace("/auditorias" as any);
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
            <ThemedText type="title">Nueva auditoría</ThemedText>
            <ThemedText style={styles.subtitle}>
              Captura la información general de la auditoría.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <View style={styles.statusHeader}>
              <ThemedText type="subtitle">Estatus inicial</ThemedText>

              <View
                style={[
                  styles.statusBadge,
                  { borderColor: getStatusColor(estatus) },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(estatus) },
                  ]}
                />
                <ThemedText style={styles.statusBadgeText}>{estatus}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.helpText}>
              Puedes asignar un estatus inicial. Después, el sistema actualizará
              el avance de la auditoría con base en el checklist.
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <ThemedText type="subtitle">Información de la auditoría</ThemedText>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Título</ThemedText>
              <TextInput
                placeholder="Ej. Auditoría de seguridad"
                placeholderTextColor="#9CA3AF"
                value={titulo}
                onChangeText={setTitulo}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Área</ThemedText>
              <TextInput
                placeholder="Ej. Almacén"
                placeholderTextColor="#9CA3AF"
                value={area}
                onChangeText={setArea}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Descripción</ThemedText>
              <TextInput
                placeholder="Describe el objetivo o alcance de la auditoría"
                placeholderTextColor="#9CA3AF"
                value={descripcion}
                onChangeText={setDescripcion}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Fecha</ThemedText>
              <TextInput
                placeholder="Ej. 2026-02-20"
                placeholderTextColor="#9CA3AF"
                value={fecha}
                onChangeText={setFecha}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Observaciones generales</ThemedText>
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

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle">Selecciona el estatus</ThemedText>

            <Pressable
              style={[
                styles.statusItem,
                estatus === "Pendiente" && styles.statusItemSelected,
              ]}
              onPress={() => setEstatus("Pendiente")}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#9CA3AF" }]} />
              <ThemedText style={styles.statusItemText}>Pendiente</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.statusItem,
                estatus === "En proceso" && styles.statusItemSelected,
              ]}
              onPress={() => setEstatus("En proceso")}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#F59E0B" }]} />
              <ThemedText style={styles.statusItemText}>En proceso</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.statusItem,
                estatus === "Finalizada" && styles.statusItemSelected,
              ]}
              onPress={() => setEstatus("Finalizada")}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#10B981" }]} />
              <ThemedText style={styles.statusItemText}>Finalizada</ThemedText>
            </Pressable>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable style={styles.primaryButton} onPress={onSave}>
              <ThemedText style={styles.primaryButtonText}>Guardar auditoría</ThemedText>
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
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  statusHeader: {
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
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
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  statusItemSelected: {
    backgroundColor: "#F3F4F6",
  },
  statusDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  statusItemText: {
    fontSize: 14,
    fontWeight: "500",
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
});