import {
  IconGauge,
  IconClipboardText,
  IconUsers,
  IconFlag,
  IconBell,
  IconSettings,
  IconAlertCircle,
} from "@tabler/icons-react";

import { ScrollArea, Stack, Text } from "@mantine/core";
import { LinksGroup } from "./LinksGroup";
import classes from "./SidebarNested.module.css";

const menu = [
  {
    label: "Dashboard",
    icon: IconGauge,
    link: "/dashboard",
  },

  {
    label: "Usuarios",
    icon: IconUsers,
    links: [
      { label: "Lista de usuarios", link: "/dashboard/usuarios" },
      { label: "Crear usuario", link: "/dashboard/usuarios/crear" },
    ],
  },

  {
    label: "Órdenes",
    icon: IconClipboardText,
    links: [
      { label: "Todas las órdenes", link: "/dashboard/ordenes" },
      { label: "Crear orden", link: "/dashboard/ordenes/crear" },
    ],
  },

  {
    label: "Estados de órdenes",
    icon: IconFlag,
    link: "/dashboard/ordenes/estados" ,
  },
];


export default function SidebarNested() {
  const links = menu.map((item) => <LinksGroup {...item} key={item.label} />);

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