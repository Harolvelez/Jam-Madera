import { apiFetch } from "./api";

export function getOrderBoard() {
  return apiFetch("/orders/board");
}

export function moveOrder(orderId: number, statusId: number) {
  return apiFetch(`/orders/${orderId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status_id: statusId }),
  });
}


export async function searchOrders(q: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `https://vision.jammaderas.com/api/orders/search?q=${q}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.json();
}
