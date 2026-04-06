import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getAuditorias } from "@/src/data/storage/auditoriasStorage";
import { clearSession, getCurrentUser } from "@/src/data/storage/authStorage";
import { getChecklist } from "@/src/data/storage/checklistStorage";
import { getEvidencias } from "@/src/data/storage/evidenciasStorage";
import { Auditoria } from "@/src/domain/models/Auditoria";
import { ChecklistItem } from "@/src/domain/models/ChecklistItem";
import { Evidencia } from "@/src/domain/models/Evidencia";

export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const user = await getCurrentUser();
        const auditoriasData = await getAuditorias();
        const checklistData = await getChecklist();
        const evidenciasData = await getEvidencias();

        if (user) {
          setUserName(user.name);
        }

        setAuditorias(auditoriasData);
        setChecklistItems(checklistData);
        setEvidencias(evidenciasData);
      };

      loadData();
    }, [])
  );

  const resumenAuditorias = useMemo(() => {
    return {
      total: auditorias.length,
      pendientes: auditorias.filter((a) => a.estatus === "Pendiente").length,
      enProceso: auditorias.filter((a) => a.estatus === "En proceso").length,
      finalizadas: auditorias.filter((a) => a.estatus === "Finalizada").length,
    };
  }, [auditorias]);

  const resumenChecklist = useMemo(() => {
    return {
      total: checklistItems.length,
      pendientes: checklistItems.filter((i) => i.estatus === "Pendiente").length,
      cumple: checklistItems.filter((i) => i.estatus === "Cumple").length,
      noCumple: checklistItems.filter((i) => i.estatus === "No cumple").length,
    };
  }, [checklistItems]);

  const ultimaAuditoria = useMemo(() => {
    if (auditorias.length === 0) return null;

    return [...auditorias].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    })[0];
  }, [auditorias]);

  const onLogout = async () => {
    await clearSession();
    router.replace("/(auth)/login");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <ThemedText type="title">Inicio</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sistema móvil de registro y seguimiento de auditorías
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Bienvenido</ThemedText>
          <ThemedText style={styles.userName}>
            {userName || "Usuario autenticado"}
          </ThemedText>
          <ThemedText style={styles.helperText}>
            Consulta el avance general del sistema y accede rápidamente a tus auditorías.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Auditorías</ThemedText>

          <View style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>Total de auditorías</ThemedText>
            <ThemedText style={styles.metricValue}>{resumenAuditorias.total}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.pendingDot]} />
              <ThemedText style={styles.metricLabel}>Pendientes</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumenAuditorias.pendientes}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.inProgressDot]} />
              <ThemedText style={styles.metricLabel}>En proceso</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumenAuditorias.enProceso}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.finishedDot]} />
              <ThemedText style={styles.metricLabel}>Finalizadas</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumenAuditorias.finalizadas}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Checklist</ThemedText>

          <View style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>Total de puntos</ThemedText>
            <ThemedText style={styles.metricValue}>{resumenChecklist.total}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.pendingDot]} />
              <ThemedText style={styles.metricLabel}>Pendientes</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumenChecklist.pendientes}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.okDot]} />
              <ThemedText style={styles.metricLabel}>Cumple</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumenChecklist.cumple}</ThemedText>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLabelWrap}>
              <View style={[styles.statusDot, styles.failDot]} />
              <ThemedText style={styles.metricLabel}>No cumple</ThemedText>
            </View>
            <ThemedText style={styles.metricValue}>{resumenChecklist.noCumple}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Evidencias</ThemedText>

          <View style={styles.metricRow}>
            <ThemedText style={styles.metricLabel}>Total de evidencias</ThemedText>
            <ThemedText style={styles.metricValue}>{evidencias.length}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle">Actividad reciente</ThemedText>

          {ultimaAuditoria ? (
            <>
              <ThemedText style={styles.recentTitle}>
                {ultimaAuditoria.titulo}
              </ThemedText>
              <ThemedText style={styles.recentText}>
                Folio: {ultimaAuditoria.folio}
              </ThemedText>
              <ThemedText style={styles.recentText}>
                Área: {ultimaAuditoria.area}
              </ThemedText>
              <ThemedText style={styles.recentText}>
                Estatus: {ultimaAuditoria.estatus}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.emptyText}>
              Aún no hay auditorías registradas.
            </ThemedText>
          )}
        </View>

        <View style={styles.actionsBlock}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/auditorias/nueva")}
          >
            <ThemedText style={styles.primaryButtonText}>
              Nueva auditoría
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/auditorias")}
          >
            <ThemedText style={styles.secondaryButtonText}>
              Ver auditorías
            </ThemedText>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
        </Pressable>
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
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
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
  okDot: {
    backgroundColor: "#10B981",
  },
  failDot: {
    backgroundColor: "#EF4444",
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  recentText: {
    fontSize: 14,
    color: "#374151",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
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
  logoutButton: {
    marginTop: 4,
    alignItems: "center",
    paddingVertical: 8,
  },
  logoutText: {
    color: "#6B7280",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});