import { AppShell, Burger, Group, Title, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SidebarNested  from "../components/Sidebar/SidebarNested"; // lo creamos en el siguiente paso



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
      {/* HEADER */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {/* Botón hamburguesa para móviles */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>Jam Maderas </Title>
          </Group>

          <Text size="sm">Usuario</Text>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar p="xs">
        <SidebarNested />
      </AppShell.Navbar>

      {/* CONTENIDO */}
      <AppShell.Main>
        <Title order={3}>Bienvenido al Dashboard</Title>
        <Text>Este será el contenido principal.</Text>
      </AppShell.Main>
    </AppShell>
  );
}