// config/permissions.js
export const PERMISSIONS = {
  DASHBOARD: [1, 2],           // admin=1, gerente=2
  AUDIT: [1, 2],               // admin=1, gerente=2
  USERS: [1, 2],               // admin=1, gerente=2
  CLIENTS: [1, 2, 3],          // admin=1, gerente=2, ventas=3
  ORDERS: [1, 2, 3],           // admin=1, gerente=2, ventas=3
  ORDER_STATUS: [1, 2, 3, 4],  // admin=1, gerente=2, ventas=3, produccion=4
  AGENDA_ALERTS: [1, 2, 3],    // admin=1, gerente=2, ventas=3
  SETTINGS: [1],               // solo admin=1
};