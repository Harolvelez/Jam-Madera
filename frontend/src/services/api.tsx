const API_URL = "http://localhost:8000/api";

export async function getOrderBoard() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/orders/board`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // token inválido o expirado
    window.location.href = "/";
    return;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}


export async function moveOrder(orderId: number, statusId: number) {
  return fetch(`${API_URL}/orders/${orderId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ status_id: statusId }),
  });
}
