import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getAuditorias } from "@/src/data/storage/auditoriasStorage";
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

export default function AuditoriasScreen() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadAuditorias = async () => {
        const data = await getAuditorias();
        setAuditorias(data);
      };

      loadAuditorias();
    }, [])
  );

  const resumen = useMemo(() => {
    return {
      total: auditorias.length,
      pendientes: auditorias.filter((a) => a.estatus === "Pendiente").length,
      enProceso: auditorias.filter((a) => a.estatus === "En proceso").length,
      finalizadas: auditorias.filter((a) => a.estatus === "Finalizada").length,
    };
  }, [auditorias]);

  const auditoriasOrdenadas = useMemo(() => {
    return [...auditorias].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [auditorias]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <ThemedText type="title">Auditorías</ThemedText>
          <ThemedText style={styles.subtitle}>
            Consulta, registra y da seguimiento a tus auditorías.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Resumen general</ThemedText>

          <View style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>Total</ThemedText>
            <ThemedText style={styles.metricValue}>{resumen.total}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.pendingDot]} />
              <ThemedText style={styles.metricLabel}>Pendientes</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumen.pendientes}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.inProgressDot]} />
              <ThemedText style={styles.metricLabel}>En proceso</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumen.enProceso}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.finishedDot]} />
              <ThemedText style={styles.metricLabel}>Finalizadas</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumen.finalizadas}</ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/auditorias/nueva")}
        >
          <ThemedText style={styles.primaryButtonText}>
            Registrar auditoría
          </ThemedText>
        </Pressable>

        {auditoriasOrdenadas.length === 0 ? (
          <View style={styles.emptyCard}>
            <ThemedText type="subtitle">Sin registros</ThemedText>
            <ThemedText style={styles.emptyText}>
              No hay auditorías registradas por el momento.
            </ThemedText>
            <ThemedText style={styles.emptyHelper}>
              Crea la primera auditoría para comenzar el seguimiento.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listBlock}>
            {auditoriasOrdenadas.map((item) => (
              <Pressable
                key={item.id}
                style={styles.auditCard}
                onPress={() =>
                  router.push({
                    pathname: "/auditorias/[id]",
                    params: { id: item.id },
                  } as any)
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderText}>
                    <ThemedText style={styles.folioText}>{item.folio}</ThemedText>
                    <ThemedText type="subtitle" style={styles.auditTitle}>
                      {item.titulo}
                    </ThemedText>
                  </View>

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

                <View style={styles.infoBlock}>
                  <ThemedText style={styles.infoText}>Área: {item.area}</ThemedText>
                  <ThemedText style={styles.infoText}>
                    Responsable: {item.responsable}
                  </ThemedText>
                  <ThemedText style={styles.infoText}>Fecha: {item.fecha}</ThemedText>
                </View>

                <ThemedText style={styles.cardLink}>
                  Ver detalle de auditoría
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
  inProgressDot: {
    backgroundColor: "#F59E0B",
  },
  finishedDot: {
    backgroundColor: "#10B981",
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
  auditCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    gap: 10,
  },
  cardHeaderText: {
    gap: 4,
  },
  folioText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  auditTitle: {
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
  infoBlock: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  cardLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
});