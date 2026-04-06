import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
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
  deleteAuditoria,
  getAuditoriaById,
  updateAuditoria,
} from "@/src/data/storage/auditoriasStorage";
import { getChecklistByAuditoria } from "@/src/data/storage/checklistStorage";
import { getEvidenciasByChecklistItem } from "@/src/data/storage/evidenciasStorage";
import { Auditoria } from "@/src/domain/models/Auditoria";
import { ChecklistItem } from "@/src/domain/models/ChecklistItem";

type AuditoriaResumen = {
  totalPuntos: number;
  pendientes: number;
  cumple: number;
  noCumple: number;
  atendidos: number;
  avance: number;
  totalEvidencias: number;
};

const resumenInicial: AuditoriaResumen = {
  totalPuntos: 0,
  pendientes: 0,
  cumple: 0,
  noCumple: 0,
  atendidos: 0,
  avance: 0,
  totalEvidencias: 0,
};

function getEstatusAutomatico(
  totalPuntos: number,
  pendientes: number
): Auditoria["estatus"] {
  if (totalPuntos === 0) return "Pendiente";
  if (pendientes > 0) return "En proceso";
  return "Finalizada";
}

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

export default function AuditoriaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estatus, setEstatus] = useState<Auditoria["estatus"]>("Pendiente");
  const [resumen, setResumen] = useState<AuditoriaResumen>(resumenInicial);

  const loadAuditoria = useCallback(async () => {
    if (!id) return null;

    const data = await getAuditoriaById(id);
    if (!data) {
      Alert.alert("Error", "No se encontró la auditoría.");
      router.back();
      return null;
    }

    setAuditoria(data);
    setTitulo(data.titulo);
    setArea(data.area);
    setDescripcion(data.descripcion);
    setFecha(data.fecha);
    setObservaciones(data.observaciones);
    setEstatus(data.estatus);

    return data;
  }, [id]);

  const loadResumen = useCallback(async () => {
    if (!id) return null;

    const checklistItems: ChecklistItem[] = await getChecklistByAuditoria(id);

    const pendientes = checklistItems.filter(
      (item) => item.estatus === "Pendiente"
    ).length;

    const cumple = checklistItems.filter(
      (item) => item.estatus === "Cumple"
    ).length;

    const noCumple = checklistItems.filter(
      (item) => item.estatus === "No cumple"
    ).length;

    const totalPuntos = checklistItems.length;
    const atendidos = cumple + noCumple;
    const avance =
      totalPuntos > 0 ? Math.round((atendidos / totalPuntos) * 100) : 0;

    let totalEvidencias = 0;

    for (const item of checklistItems) {
      const evidencias = await getEvidenciasByChecklistItem(item.id);
      totalEvidencias += evidencias.length;
    }

    const resumenCalculado: AuditoriaResumen = {
      totalPuntos,
      pendientes,
      cumple,
      noCumple,
      atendidos,
      avance,
      totalEvidencias,
    };

    setResumen(resumenCalculado);
    return resumenCalculado;
  }, [id]);

  const syncEstatusAutomatico = useCallback(
    async (auditoriaActual: Auditoria, resumenActual: AuditoriaResumen) => {
      const estatusCalculado = getEstatusAutomatico(
        resumenActual.totalPuntos,
        resumenActual.pendientes
      );

      if (auditoriaActual.estatus === estatusCalculado) {
        setEstatus(estatusCalculado);
        setAuditoria(auditoriaActual);
        return;
      }

      const auditoriaActualizada: Auditoria = {
        ...auditoriaActual,
        estatus: estatusCalculado,
        updatedAt: new Date().toISOString(),
      };

      await updateAuditoria(auditoriaActualizada);

      setAuditoria(auditoriaActualizada);
      setEstatus(estatusCalculado);
    },
    []
  );

  const loadScreenData = useCallback(async () => {
    const auditoriaData = await loadAuditoria();
    const resumenData = await loadResumen();

    if (!auditoriaData || !resumenData) return;

    await syncEstatusAutomatico(auditoriaData, resumenData);
  }, [loadAuditoria, loadResumen, syncEstatusAutomatico]);

  useFocusEffect(
    useCallback(() => {
      loadScreenData();
    }, [loadScreenData])
  );

  const onUpdate = async () => {
    if (!auditoria) return;

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

    const updatedAuditoria: Auditoria = {
      ...auditoria,
      titulo: titulo.trim(),
      area: area.trim(),
      descripcion: descripcion.trim(),
      fecha: fecha.trim(),
      observaciones: observaciones.trim(),
      estatus,
      updatedAt: new Date().toISOString(),
    };

    await updateAuditoria(updatedAuditoria);
    Alert.alert("Éxito", "Auditoría actualizada correctamente.");
    router.back();
  };

  const onDelete = async () => {
    if (!auditoria) return;

    Alert.alert("Eliminar auditoría", "¿Deseas eliminar esta auditoría?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteAuditoria(auditoria.id);
          Alert.alert("Éxito", "Auditoría eliminada correctamente.");
          router.replace("/auditorias" as any);
        },
      },
    ]);
  };

  const onGoChecklist = () => {
    if (!auditoria) return;

    router.push({
      pathname: "/auditorias/checklist/[auditoriaId]",
      params: { auditoriaId: auditoria.id },
    } as any);
  };

  if (!auditoria) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Cargando auditoría...</ThemedText>
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
            <ThemedText type="title">Detalle de auditoría</ThemedText>
            <ThemedText style={styles.subtitle}>Folio: {auditoria.folio}</ThemedText>
          </View>

          <View style={styles.card}>
            <View style={styles.statusHeader}>
              <ThemedText type="subtitle">Resumen del checklist</ThemedText>

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

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Total de puntos</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.totalPuntos}</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Pendientes</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.pendientes}</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Cumple</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.cumple}</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>No cumple</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.noCumple}</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Atendidos</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.atendidos}</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Avance</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.avance}%</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Evidencias</ThemedText>
              <ThemedText style={styles.summaryValue}>{resumen.totalEvidencias}</ThemedText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <ThemedText type="subtitle">Información de la auditoría</ThemedText>
            <ThemedText style={styles.helpText}>
              La auditoría se marca como finalizada automáticamente cuando todos
              los puntos del checklist están atendidos.
            </ThemedText>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Título</ThemedText>
              <TextInput value={titulo} onChangeText={setTitulo} style={styles.input} />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Área</ThemedText>
              <TextInput value={area} onChangeText={setArea} style={styles.input} />
            </View>

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
              <ThemedText style={styles.label}>Fecha</ThemedText>
              <TextInput value={fecha} onChangeText={setFecha} style={styles.input} />
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Observaciones generales</ThemedText>
              <TextInput
                value={observaciones}
                onChangeText={setObservaciones}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle">Estatus del proceso</ThemedText>
            <ThemedText style={styles.helpText}>
              Para finalizar esta auditoría, asegúrate de que ningún punto del checklist quede en estado Pendiente.
            </ThemedText>

            <View
              style={[
                styles.statusItem,
                estatus === "Pendiente" && styles.statusItemSelected,
              ]}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#9CA3AF" }]} />
              <ThemedText style={styles.statusItemText}>Pendiente</ThemedText>
            </View>

            <View
              style={[
                styles.statusItem,
                estatus === "En proceso" && styles.statusItemSelected,
              ]}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#F59E0B" }]} />
              <ThemedText style={styles.statusItemText}>En proceso</ThemedText>
            </View>

            <View
              style={[
                styles.statusItem,
                estatus === "Finalizada" && styles.statusItemSelected,
              ]}
            >
              <View style={[styles.statusDotLarge, { backgroundColor: "#10B981" }]} />
              <ThemedText style={styles.statusItemText}>Finalizada</ThemedText>
            </View>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable style={styles.primaryButton} onPress={onUpdate}>
              <ThemedText style={styles.primaryButtonText}>Guardar cambios</ThemedText>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onGoChecklist}>
              <ThemedText style={styles.secondaryButtonText}>Ver checklist</ThemedText>
            </Pressable>

            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <ThemedText style={styles.deleteButtonText}>Eliminar auditoría</ThemedText>
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
  loadingContainer: {
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
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