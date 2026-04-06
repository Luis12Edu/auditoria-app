import { ChecklistItem } from "@/src/domain/models/ChecklistItem";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHECKLIST_KEY = "AUDITAPP_CHECKLIST";

export async function getChecklist(): Promise<ChecklistItem[]> {
  const raw = await AsyncStorage.getItem(CHECKLIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveChecklist(items: ChecklistItem[]) {
  await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));
}

export async function getChecklistByAuditoria(auditoriaId: string) {
  const items = await getChecklist();
  return items.filter((i) => i.auditoriaId === auditoriaId);
}

export async function getChecklistItemById(id: string): Promise<ChecklistItem | null> {
  const items = await getChecklist();
  return items.find((i) => i.id === id) || null;
}

export async function addChecklistItem(item: ChecklistItem) {
  const items = await getChecklist();
  items.push(item);
  await saveChecklist(items);
}

export async function updateChecklistItem(updated: ChecklistItem) {
  const items = await getChecklist();

  const newItems = items.map((i) =>
    i.id === updated.id ? updated : i
  );

  await saveChecklist(newItems);
}

export async function deleteChecklistItem(id: string) {
  const items = await getChecklist();

  const newItems = items.filter((i) => i.id !== id);

  await saveChecklist(newItems);
}