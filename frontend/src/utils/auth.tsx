// utils/auth.ts

export interface UserData {
  id?: number;
  name?: string;
  email?: string;
  role_id?: number;
  role_name?: string;
  role?: string;
  token?: string;
}

export function getUser(): UserData {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : {};
  } catch {
    return {};
  }
}

/**
 * Verifica si el usuario actual puede acceder
 * @param allowedRoles - Roles permitidos (IDs o nombres)
 * @returns {boolean}
 */
export function canAccess(allowedRoles: (string | number)[]): boolean {
  // Si no hay roles definidos, permitir acceso (o false según tu lógica)
  if (!allowedRoles || !Array.isArray(allowedRoles)) {
    console.warn('canAccess: allowedRoles no es un array válido', allowedRoles);
    return false; // o true si quieres acceso público cuando no hay roles
  }

  const user = getUser();
  
  // Si no hay usuario, no puede acceder
  if (!user || user.role_id === undefined) {
    return false;
  }

  // Convertir user.role_id a string y número para comparaciones
  const userRoleId = user.role_id;
  const userRoleIdStr = userRoleId.toString();
  
  // Verificar cada rol permitido
  return allowedRoles.some(role => {
    // Si role es número, comparar con user.role_id
    if (typeof role === 'number' && role === userRoleId) {
      return true;
    }
    
    // Si role es string, convertir y comparar
    if (typeof role === 'string') {
      // Comparar como string "1" === "1"
      if (role === userRoleIdStr) return true;
      
      // Comparar con user.role (nombre)
      if (user.role && role.toLowerCase() === user.role.toLowerCase()) return true;
      
      // Comparar con user.role_name
      if (user.role_name && role.toLowerCase() === user.role_name.toLowerCase()) return true;
    }
    
    return false;
  });
}