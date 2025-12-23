export async function fetchUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://127.0.0.1:8000/api/users/simple", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}