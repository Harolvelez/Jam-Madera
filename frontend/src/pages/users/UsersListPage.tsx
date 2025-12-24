import { useEffect, useState } from "react";
import {
  Title,
  Table,
  Paper,
  Loader,
  Center,
  Group,
  Button,
  Modal,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate, useLocation } from "react-router-dom";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role_id: number;
};

const roleName = (role_id: number) => {
  switch (role_id) {
    case 1:
      return "Admin";
    case 2:
      return "Gerente";
    case 3:
      return "Ventas";
    case 4:
      return "Producción";
    default:
      return `Rol ${role_id}`;
  }
};

export default function UsersListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [opened, setOpened] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);

  const token = localStorage.getItem("token");

  // 👤 Usuario logueado
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudieron cargar usuarios");

      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e.message || "Error cargando usuarios",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [location.key]);

  const openDelete = (u: UserRow) => {
    setUserToDelete(u);
    setOpened(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("No se pudo eliminar");

      notifications.show({
        title: "Listo",
        message: "Usuario eliminado",
        color: "green",
      });

      setUsers((prev) => prev.filter((x) => x.id !== userToDelete.id));
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e.message || "Error eliminando",
        color: "red",
      });
    } finally {
      setOpened(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Paper p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Usuarios</Title>
        <Button onClick={() => navigate("/dashboard/usuarios/crear")}>
          Crear usuario
        </Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Rol</Table.Th>
            <Table.Th style={{ width: 220 }}>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {users.map((u) => {
            const isAdminRow = u.role_id === 1;
            const isCurrentAdmin = currentUser?.role_id === 1;
            const isSameUser = currentUser?.id === u.id;

            // ✅ EDITAR
            const disableEdit = isAdminRow && !isCurrentAdmin;

            // ❌ ELIMINAR
            const disableDelete =
              (isAdminRow && !isCurrentAdmin) ||
              (isAdminRow && isSameUser);

            return (
              <Table.Tr
                key={u.id}
                style={{
                  opacity: isAdminRow && !isCurrentAdmin ? 0.5 : 1,
                }}
              >
                <Table.Td>{u.id}</Table.Td>
                <Table.Td>{u.name}</Table.Td>
                <Table.Td>{u.email}</Table.Td>
                <Table.Td>
                  {roleName(u.role_id)}
                  {isAdminRow && (
                    <Text size="xs" c="dimmed">
                      Protegido
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      variant="light"
                      disabled={disableEdit}
                      onClick={() =>
                        navigate(`/dashboard/usuarios/editar/${u.id}`)
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      disabled={disableDelete}
                      onClick={() => openDelete(u)}
                    >
                      Eliminar
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="¿Eliminar usuario?"
        centered
      >
        <Text mb="md">
          ¿Seguro que quieres eliminar a{" "}
          <strong>{userToDelete?.name}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)}>
            Cancelar
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Sí, eliminar
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}