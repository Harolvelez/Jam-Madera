import {
  IconGauge,
  IconClipboardText,
  IconUsers,
  IconCalendar,
} from "@tabler/icons-react";

import { ScrollArea, Stack, Text } from "@mantine/core";
import { LinksGroup } from "./LinksGroup";
import classes from "./SidebarNested.module.css";

import { PERMISSIONS } from "../../config/permissions";
import { canAccess } from "../../utils/auth";

/* =========================
   MENÚ FINAL LIMPIO
========================= */
const menu = [
  // DASHBOARD (Admin / Gerente)
  {
    label: "Dashboard",
    icon: IconGauge,
    link: "/dashboard",
    roles: PERMISSIONS.DASHBOARD,
  },

  // AUDITORÍA (Admin / Gerente)
  {
    label: "Auditoría",
    icon: IconGauge,
    link: "/dashboard/auditoria",
    roles: PERMISSIONS.AUDIT,
  },
  {
    label: "Clientes",
    icon: IconUsers,
    links: [
      { label: "Crear o editar", link: "/dashboard/clientes" },
    ],
  },
  // USUARIOS (Admin / Gerente)
  {
    label: "Usuarios",
    icon: IconUsers,
    roles: PERMISSIONS.USERS,
    links: [
      { label: "Lista de usuarios", link: "/dashboard/usuarios" },
      { label: "Crear usuario", link: "/dashboard/usuarios/crear" },
    ],
  },

  // ÓRDENES (Admin / Gerente / Ventas)
  {
    label: "Órdenes",
    icon: IconClipboardText,
    roles: PERMISSIONS.ORDERS,
    links: [
      { label: "Todas las órdenes", link: "/dashboard/orders/OrderList" },
      { label: "Crear orden", link: "/dashboard/orders/CreateOrder" },
    ],
  },

  // ESTADOS Y CALENDARIO (Admin / Gerente / Ventas)
  {
    label: "Estados de órdenes", // <-- CAMBIÉ EL NOMBRE
    icon: IconCalendar,
    roles: PERMISSIONS.ORDER_STATUS,
    links: [
      { label: "Tablero", link: "/dashboard/ordenes/estados" },
      { label: "Calendario", link: "/dashboard/ordenes/calendario" },
    ],
  },
];

// Añadí la interfaz para las props
interface SidebarNestedProps {
  onLinkClick?: () => void;
}

export default function SidebarNested({ onLinkClick }: SidebarNestedProps) {
  // 🔐 Filtrar menú según permisos
  const links = menu
    .filter((item) => canAccess(item.roles ?? []))
    .map((item) => (
      <LinksGroup 
        {...item} 
        key={item.label} 
        onLinkClick={onLinkClick} // Pasé onLinkClick
      />
    ));

  return (
    <nav className={classes.navbar}>
      <Text fw={700} fz="sm" className={classes.title}>
        Menu
      </Text>

      <ScrollArea className={classes.links}>
        <Stack>{links}</Stack>
      </ScrollArea>
    </nav>
  );
}