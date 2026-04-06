import { Evidencia } from "@/src/domain/models/Evidencia";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EVIDENCIAS_KEY = "AUDITAPP_EVIDENCIAS";

export async function getEvidencias(): Promise<Evidencia[]> {
  const raw = await AsyncStorage.getItem(EVIDENCIAS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveEvidencias(evidencias: Evidencia[]) {
  await AsyncStorage.setItem(EVIDENCIAS_KEY, JSON.stringify(evidencias));
}

export async function getEvidenciasByChecklistItem(checklistItemId: string) {
  const evidencias = await getEvidencias();
  return evidencias.filter((e) => e.checklistItemId === checklistItemId);
}

export async function addEvidencia(evidencia: Evidencia) {
  const evidencias = await getEvidencias();
  evidencias.push(evidencia);
  await saveEvidencias(evidencias);
}

export async function deleteEvidencia(id: string) {
  const evidencias = await getEvidencias();
  const nuevas = evidencias.filter((e) => e.id !== id);
  await saveEvidencias(nuevas);
}