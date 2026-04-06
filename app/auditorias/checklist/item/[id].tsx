import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
    deleteChecklistItem,
    getChecklistItemById,
    updateChecklistItem,
} from "@/src/data/storage/checklistStorage";
import { ChecklistItem } from "@/src/domain/models/ChecklistItem";

function getStatusColor(estatus: ChecklistItem["estatus"]) {
  switch (estatus) {
    case "Pendiente":
      return "#9CA3AF";
    case "Cumple":
      return "#10B981";
    case "No cumple":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

export default function ChecklistItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<ChecklistItem | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estatus, setEstatus] = useState<ChecklistItem["estatus"]>("Pendiente");

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;

      const data = await getChecklistItemById(id);

      if (!data) {
        Alert.alert("Error", "No se encontró el punto del checklist.");
        router.back();
        return;
      }

      setItem(data);
      setDescripcion(data.descripcion);
      setObservaciones(data.observaciones);
      setEstatus(data.estatus);
    };

    loadItem();
  }, [id]);

  const onUpdate = async () => {
    if (!item) return;

    if (!descripcion.trim()) {
      return Alert.alert("Validación", "La descripción es obligatoria.");
    }

    const updatedItem: ChecklistItem = {
      ...item,
      descripcion: descripcion.trim(),
      observaciones: observaciones.trim(),
      estatus,
    };

    await updateChecklistItem(updatedItem);
    Alert.alert("Éxito", "Punto actualizado correctamente.");
    router.back();
  };

  const onDelete = async () => {
    if (!item) return;

    Alert.alert("Eliminar punto", "¿Deseas eliminar este punto del checklist?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteChecklistItem(item.id);
          Alert.alert("Éxito", "Punto eliminado correctamente.");
          router.back();
        },
      },
    ]);
  };

  const onGoEvidencias = () => {
    if (!item) return;

    router.push({
      pathname: "/auditorias/checklist/evidencias/[checklistItemId]",
      params: { checklistItemId: item.id },
    } as any);
  };

  if (!item) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Cargando punto...</ThemedText>
      </ThemedView>
    );
  }

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
            <ThemedText type="title">Detalle del punto</ThemedText>
            <ThemedText style={styles.subtitle}>
              Edita la información y da seguimiento al estatus del checklist.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <View style={styles.statusHeader}>
              <ThemedText type="subtitle">Estado del punto</ThemedText>

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
              Cambia el estatus del punto según el resultado de la revisión y agrega observaciones cuando sea necesario.
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <ThemedText type="subtitle">Información del punto</ThemedText>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Descripción</ThemedText>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Observaciones</ThemedText>
              <TextInput
                value={observaciones}
                onChangeText={setObservaciones}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle">Estatus</ThemedText>

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
                estatus === "Cumple" && styles.statusItemSelected,
              ]}
              onPress={() => setEstatus("Cumple")}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#10B981" }]} />
              <ThemedText style={styles.statusItemText}>Cumple</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.statusItem,
                estatus === "No cumple" && styles.statusItemSelected,
              ]}
              onPress={() => setEstatus("No cumple")}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#EF4444" }]} />
              <ThemedText style={styles.statusItemText}>No cumple</ThemedText>
            </Pressable>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable style={styles.primaryButton} onPress={onUpdate}>
              <ThemedText style={styles.primaryButtonText}>Guardar cambios</ThemedText>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onGoEvidencias}>
              <ThemedText style={styles.secondaryButtonText}>Ver evidencias</ThemedText>
            </Pressable>

            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <ThemedText style={styles.deleteButtonText}>Eliminar punto</ThemedText>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
    flexGrow: 1,
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
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
});