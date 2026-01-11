import {
  AppShell,
  Burger,
  Group,
  Title,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { IconLogout } from "@tabler/icons-react";
import SidebarNested from "../components/Sidebar/SidebarNested";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [opened, { toggle, close }] = useDisclosure();

  // ⏱️ tiempo de sesión en segundos
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    let start = Number(localStorage.getItem("session_start"));

    if (!start) {
      start = Date.now();
      localStorage.setItem("session_start", start.toString());
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      setSessionSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 👤 Usuario logueado
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300, // Cambié de 260 a 300 (más ancho)
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          {/* IZQUIERDA */}
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>Jam Maderas</Title>
          </Group>

          {/* DERECHA — USUARIO */}
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="sm">
                  <Avatar radius="xl" color="blue">
                    {user?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Text size="sm" fw={500}>
                    {user?.name || "Usuario"}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{user?.email}</Menu.Label>

              <Menu.Item disabled>
                <Text size="xs" c="dimmed">
                  Sesión activa: {formatTime(sessionSeconds)}
                </Text>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Cerrar sesión
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md"> {/* Cambié de p="xs" a p="md" */}
        <SidebarNested onLinkClick={close} />
      </AppShell.Navbar>

      {/* CONTENIDO */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}