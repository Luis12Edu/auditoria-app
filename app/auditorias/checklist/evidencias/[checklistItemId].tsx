import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    deleteEvidencia,
    getEvidenciasByChecklistItem,
} from "@/src/data/storage/evidenciasStorage";
import { Evidencia } from "@/src/domain/models/Evidencia";

export default function EvidenciasScreen() {
  const { checklistItemId } = useLocalSearchParams<{ checklistItemId: string }>();
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);

  const loadEvidencias = useCallback(async () => {
    if (!checklistItemId) return;

    const data = await getEvidenciasByChecklistItem(checklistItemId);
    setEvidencias(data);
  }, [checklistItemId]);

  useFocusEffect(
    useCallback(() => {
      loadEvidencias();
    }, [loadEvidencias])
  );

  const evidenciasOrdenadas = useMemo(() => {
    return [...evidencias].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [evidencias]);

  const onDelete = async (id: string) => {
    await deleteEvidencia(id);
    await loadEvidencias();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <ThemedText type="title">Evidencias</ThemedText>
          <ThemedText style={styles.subtitle}>
            Consulta y administra las evidencias registradas para este punto del checklist.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Resumen</ThemedText>

          <View style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>Total de evidencias</ThemedText>
            <ThemedText style={styles.metricValue}>{evidencias.length}</ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/auditorias/checklist/evidencias/nueva",
              params: { checklistItemId },
            } as any)
          }
        >
          <ThemedText style={styles.primaryButtonText}>Agregar evidencia</ThemedText>
        </Pressable>

        {evidenciasOrdenadas.length === 0 ? (
          <View style={styles.emptyCard}>
            <ThemedText type="subtitle">Sin evidencias registradas</ThemedText>
            <ThemedText style={styles.emptyText}>
              Este punto aún no tiene evidencias.
            </ThemedText>
            <ThemedText style={styles.emptyHelper}>
              Agrega una imagen y un comentario para documentar la revisión.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listBlock}>
            {evidenciasOrdenadas.map((item) => (
              <View key={item.id} style={styles.evidenceCard}>
                <Image source={{ uri: item.imageUri }} style={styles.image} />

                <View style={styles.infoBlock}>
                  <ThemedText type="subtitle">Comentario</ThemedText>
                  <ThemedText style={styles.commentText}>
                    {item.comentario?.trim() ? item.comentario : "Sin comentario"}
                  </ThemedText>
                </View>

                <View style={styles.dateBlock}>
                  <ThemedText style={styles.dateLabel}>Fecha de registro</ThemedText>
                  <ThemedText style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleString()}
                  </ThemedText>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => onDelete(item.id)}
                >
                  <ThemedText style={styles.deleteButtonText}>
                    Eliminar evidencia
                  </ThemedText>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#374151",
  },
  emptyHelper: {
    fontSize: 13,
    color: "#6B7280",
  },
  listBlock: {
    gap: 12,
  },
  evidenceCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  infoBlock: {
    gap: 6,
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  dateBlock: {
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  dateText: {
    fontSize: 13,
    color: "#111827",
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
});