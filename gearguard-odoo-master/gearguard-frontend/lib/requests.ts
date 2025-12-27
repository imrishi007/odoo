import { apiFetch } from "./api";

export type MaintenanceType = "corrective" | "preventive";

export interface CreateRequestPayload {
  subject: string;
  equipment_id: number;
  maintenance_type: MaintenanceType;
}

export function createRequest(payload: CreateRequestPayload) {
  return apiFetch("/api/requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateRequestStage(
  requestId: number,
  stage: string,
  actual_duration_hours?: number
) {
  return apiFetch(`/api/requests/${requestId}/stage`, {
    method: "PATCH",
    body: JSON.stringify({
      stage,
      actual_duration_hours
    })
  });
}
