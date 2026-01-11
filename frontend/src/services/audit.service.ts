import type { AuditResponse } from "../types/audit";

const API_URL = "https://vision.jammaderas.com/api";

function buildQuery(params: Record<string, any>) {
  return new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
}

/**
 * ✅ GET Auditoría
 */
export async function fetchAudit(params: {
  order_id?: string;
  changed_by?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  page?: number;
}): Promise<AuditResponse> {
  const token = localStorage.getItem("token");

  const query = buildQuery(params);

  const res = await fetch(`${API_URL}/audit/order-status?${query}`, {
    method: "GET",
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

/**
 * ✅ DELETE Eliminar historial (solo admin/gerente)
 * ids: [1,2,3]
 */
export async function deleteAuditHistory(ids: number[]) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/audit/order-status-history/delete`, {
    method: "POST", // 👈 CAMBIAMOS DELETE → POST
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Error eliminando historial");
  }

  return res.json();
}

