import {
  IconGauge,
  IconClipboardText,
  IconUsers,
  IconAlertCircle,
  IconChecklist,
} from "@tabler/icons-react";

import { ScrollArea, Stack, Text } from "@mantine/core";
import { LinksGroup } from "./LinksGroup";
import classes from "./SidebarNested.module.css";

import { PERMISSIONS } from "../../config/permissions";
import { canAccess } from "../../utils/auth";

/* =========================
   MENÚ CON PERMISOS
========================= */
const menu = [
  // DASHBOARD (Admin / Gerente)
  {
    label: "Dashboard",
    icon: IconGauge,
    link: "/dashboard",
    roles: PERMISSIONS.DASHBOARD,
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

  // ESTADO DE ÓRDENES (TODOS)
  {
    label: "Estado de órdenes",
    icon: IconChecklist,
    link: "/dashboard/order-status",
    roles: PERMISSIONS.ORDER_STATUS,
  },

  // AGENDA Y ALERTAS (Admin / Gerente / Ventas)
  {
    label: "Agenda y alertas",
    icon: IconAlertCircle,
    roles: PERMISSIONS.AGENDA_ALERTS,
    links: [
      { label: "Agenda", link: "/dashboard/agenda" },
      { label: "Alertas", link: "/dashboard/alertas" },
    ],
  },
];

export default function SidebarNested() {
  // 🔐 Filtrar menú según rol
  const links = menu
    .filter((item) => canAccess(item.roles))
    .map((item) => <LinksGroup {...item} key={item.label} />);

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
