import { AppShell, Burger, Group, Title, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SidebarNested from "../components/Sidebar/SidebarNested";
import { Outlet } from "react-router-dom"; // ✅ AÑADIR


export default function Dashboard() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>Jam Maderas</Title>
          </Group>
          <Text size="sm">Usuario</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <SidebarNested />
      </AppShell.Navbar>

      {/* ✅ AQUÍ se renderizan las páginas hijas */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
