import { apiFetch } from "./api";

export interface CalendarOrder {
  id: number;
  order_number: string;
  client: string;
  status: string;
}

export interface CalendarResponse {
  year: number;
  month: number;
  days: Record<string, CalendarOrder[]>;
}

const statusLabel: Record<string, string> = {
  finalizado: "Entregado",
};

export async function fetchOrdersCalendar(
  year: number,
  month: number
): Promise<CalendarResponse> {
  const data = await apiFetch<CalendarResponse>(
    `/orders/calendar?year=${year}&month=${month}`
  );

  // ✅ Traducir status visual
  const days = Object.fromEntries(
    Object.entries(data.days || {}).map(([day, orders]) => [
      day,
      (orders || []).map((o) => ({
        ...o,
        status: statusLabel[(o.status ?? "").toLowerCase()] ?? o.status,
      })),
    ])
  );

  return { ...data, days };
}
