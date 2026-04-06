export type EstatusChecklist = "Cumple" | "No cumple" | "Pendiente";

export interface ChecklistItem {
  id: string;
  auditoriaId: string;
  descripcion: string;
  estatus: EstatusChecklist;
  observaciones: string;
  createdAt: string;
}