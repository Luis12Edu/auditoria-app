import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { getChecklistByAuditoria } from "@/src/data/storage/checklistStorage";
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

export default function ChecklistScreen() {
  const { auditoriaId } = useLocalSearchParams<{ auditoriaId: string }>();
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadChecklist = async () => {
        if (!auditoriaId) return;

        const data = await getChecklistByAuditoria(auditoriaId);
        setItems(data);
      };

      loadChecklist();
    }, [auditoriaId])
  );

  const resumen = useMemo(() => {
    return {
      total: items.length,
      cumple: items.filter((i) => i.estatus === "Cumple").length,
      noCumple: items.filter((i) => i.estatus === "No cumple").length,
      pendiente: items.filter((i) => i.estatus === "Pendiente").length,
    };
  }, [items]);

  const itemsOrdenados = useMemo(() => {
    const prioridad: Record<ChecklistItem["estatus"], number> = {
      Pendiente: 0,
      "No cumple": 1,
      Cumple: 2,
    };

    return [...items].sort((a, b) => {
      const porEstatus = prioridad[a.estatus] - prioridad[b.estatus];
      if (porEstatus !== 0) return porEstatus;

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [items]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <ThemedText type="title">Checklist de auditoría</ThemedText>
          <ThemedText style={styles.subtitle}>
            Da seguimiento a cada punto de verificación de esta auditoría.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Resumen del checklist</ThemedText>

          <View style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>Total de puntos</ThemedText>
            <ThemedText style={styles.metricValue}>{resumen.total}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.pendingDot]} />
              <ThemedText style={styles.metricLabel}>Pendiente</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumen.pendiente}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.okDot]} />
              <ThemedText style={styles.metricLabel}>Cumple</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumen.cumple}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.failDot]} />
              <ThemedText style={styles.metricLabel}>No cumple</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumen.noCumple}</ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/auditorias/checklist/nuevo-item",
              params: { auditoriaId },
            } as any)
          }
        >
          <ThemedText style={styles.primaryButtonText}>
            Agregar punto de verificación
          </ThemedText>
        </Pressable>

        {itemsOrdenados.length === 0 ? (
          <View style={styles.emptyCard}>
            <ThemedText type="subtitle">Sin puntos registrados</ThemedText>
            <ThemedText style={styles.emptyText}>
              Esta auditoría aún no tiene checklist.
            </ThemedText>
            <ThemedText style={styles.emptyHelper}>
              Agrega puntos de verificación para comenzar la revisión.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listBlock}>
            {itemsOrdenados.map((item) => (
              <Pressable
                key={item.id}
                style={styles.itemCard}
                onPress={() =>
                  router.push({
                    pathname: "/auditorias/checklist/item/[id]",
                    params: { id: item.id },
                  } as any)
                }
              >
                <View style={styles.itemHeader}>
                  <ThemedText type="subtitle" style={styles.itemTitle}>
                    {item.descripcion}
                  </ThemedText>

                  <View
                    style={[
                      styles.statusBadge,
                      { borderColor: getStatusColor(item.estatus) },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(item.estatus) },
                      ]}
                    />
                    <ThemedText style={styles.statusBadgeText}>
                      {item.estatus}
                    </ThemedText>
                  </View>
                </View>

                {item.observaciones ? (
                  <ThemedText style={styles.observationText}>
                    Observaciones: {item.observaciones}
                  </ThemedText>
                ) : (
                  <ThemedText style={styles.helperText}>
                    Sin observaciones registradas.
                  </ThemedText>
                )}

                <ThemedText style={styles.cardLink}>
                  Ver detalle del punto
                </ThemedText>
              </Pressable>
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
  metricLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  pendingDot: {
    backgroundColor: "#9CA3AF",
  },
  okDot: {
    backgroundColor: "#10B981",
  },
  failDot: {
    backgroundColor: "#EF4444",
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
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  itemHeader: {
    gap: 10,
  },
  itemTitle: {
    color: "#111827",
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
  observationText: {
    fontSize: 14,
    color: "#374151",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
  },
  cardLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
});