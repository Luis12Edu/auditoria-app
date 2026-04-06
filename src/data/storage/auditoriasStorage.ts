import { Auditoria } from "@/src/domain/models/Auditoria";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUDITORIAS_KEY = "AUDITAPP_AUDITORIAS";

export async function getAuditorias(): Promise<Auditoria[]> {
  const raw = await AsyncStorage.getItem(AUDITORIAS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAuditorias(auditorias: Auditoria[]): Promise<void> {
  await AsyncStorage.setItem(AUDITORIAS_KEY, JSON.stringify(auditorias));
}

export async function generateAuditoriaFolio(): Promise<string> {
  const auditorias = await getAuditorias();
  const nextNumber = auditorias.length + 1;
  return `AUD-${String(nextNumber).padStart(3, "0")}`;
}

export async function addAuditoria(auditoria: Auditoria): Promise<void> {
  const auditorias = await getAuditorias();
  auditorias.push(auditoria);
  await saveAuditorias(auditorias);
}

export async function getAuditoriaById(id: string): Promise<Auditoria | null> {
  const auditorias = await getAuditorias();
  return auditorias.find((item) => item.id === id) || null;
}

export async function updateAuditoria(updatedAuditoria: Auditoria): Promise<void> {
  const auditorias = await getAuditorias();

  const nuevasAuditorias = auditorias.map((item) =>
    item.id === updatedAuditoria.id ? updatedAuditoria : item
  );

  await saveAuditorias(nuevasAuditorias);
}

export async function deleteAuditoria(id: string): Promise<void> {
  const auditorias = await getAuditorias();

  const nuevasAuditorias = auditorias.filter((item) => item.id !== id);

  await saveAuditorias(nuevasAuditorias);
}