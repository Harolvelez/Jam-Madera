
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

export async function fetchOrdersCalendar(
  year: number,
  month: number
): Promise<CalendarResponse> {
    return apiFetch<CalendarResponse>(
        `/orders/calendar?year=${year}&month=${month}`
    );
}