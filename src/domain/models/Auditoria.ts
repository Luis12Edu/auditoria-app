export type EstatusAuditoria = "Pendiente" | "En proceso" | "Finalizada";

export interface Auditoria {
  id: string;
  folio: string;
  titulo: string;
  area: string;
  descripcion: string;
  fecha: string;
  responsable: string;
  estatus: EstatusAuditoria;
  observaciones: string;
  createdAt: string;
  updatedAt?: string;
}