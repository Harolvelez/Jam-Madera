export async function searchOrders(q: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `http://127.0.0.1:8000/api/orders/search?q=${q}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.json();
}
