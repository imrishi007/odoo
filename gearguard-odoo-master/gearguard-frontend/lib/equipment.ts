import { apiFetch } from "@/lib/api";

export interface Equipment {
  id: number;
  name: string;
  location?: string;
  status?: string;
}

export function getEquipment() {
  return apiFetch<Equipment[]>("/api/equipment");
}
