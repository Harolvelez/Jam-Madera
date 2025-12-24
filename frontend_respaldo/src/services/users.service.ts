export async function fetchUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://vision.jammaderas.com/api/users/simple", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
