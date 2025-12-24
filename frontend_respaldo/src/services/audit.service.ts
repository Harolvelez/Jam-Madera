import type { AuditResponse } from "../types/audit";

const API_URL = "https://vision.jammaderas.com/api";

export async function fetchAudit(params: {
  order_id?: string;
  changed_by?: string;
  from?: string;
  to?: string;
  page?: number;
}): Promise<AuditResponse> {
  const token = localStorage.getItem("token");

  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  const res = await fetch(`${API_URL}/audit/order-status?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Error cargando auditoría");
  }

  return res.json();
}
