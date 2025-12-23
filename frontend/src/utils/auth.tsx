export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function canAccess(allowedRoles: number[]) {
  const user = getUser();
  return allowedRoles.includes(user?.role_id);
}
