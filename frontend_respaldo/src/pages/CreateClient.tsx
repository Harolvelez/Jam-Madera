import { useState, useEffect } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Group,
  Alert,
  Modal,
  Table,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconTrash, IconPlus, IconEdit } from "@tabler/icons-react";

// 🔹 Tipo para cliente
type Client = {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export default function CreateClientPage() {
  // Lista de clientes
  const [clients, setClients] = useState<Client[]>([]);

  // Modal para crear/editar cliente
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  const getToken = () => localStorage.getItem("token");

  // Cargar lista de clientes
  const loadClients = async () => {
    const token = getToken();
    if (!token) {
      setError("Debes iniciar sesión.");
      return;
    }

    try {
      const res = await fetch("https://vision.jammaderas.com/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar clientes");

      const data = await res.json();
      setClients(data);
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", notes: "" });
    setModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (client: Client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
      notes: client.notes,
    });
    setModalOpen(true);
  };

  // Guardar cliente (crear o editar)
  const handleSaveClient = async () => {
    setError("");
    const token = getToken();

    if (!token) {
      setError("Debes iniciar sesión.");
      return;
    }

    if (!formData.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `https://vision.jammaderas.com/api/clients/${editingId}`
        : "https://vision.jammaderas.com/api/clients";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Error al ${editingId ? "actualizar" : "crear"} cliente`);
      }

      setSuccess(editingId ? "Cliente actualizado correctamente" : "Cliente creado correctamente");
      await loadClients();
      setModalOpen(false);
      setFormData({ name: "", phone: "", email: "", notes: "" });
      setEditingId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Eliminar cliente
  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este cliente?")) {
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Debes iniciar sesión.");
      return;
    }

    try {
      const res = await fetch(`https://vision.jammaderas.com/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al eliminar cliente");
      }

      setSuccess("Cliente eliminado correctamente");
      await loadClients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Paper p="lg" radius="md" shadow="md">
        <Group justify="space-between" mb="lg">
          <Title order={2}>Gestionar Clientes</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Nuevo cliente
          </Button>
        </Group>

        {error && <Alert color="red" mb="md">{error}</Alert>}
        {success && <Alert color="green" mb="md">{success}</Alert>}

        {/* Tabla de clientes */}
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Teléfono</Table.Th>
              <Table.Th>Correo</Table.Th>
              <Table.Th>Notas</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clients.map((client) => (
              <Table.Tr key={client.id}>
                <Table.Td>{client.name}</Table.Td>
                <Table.Td>{client.phone}</Table.Td>
                <Table.Td>{client.email}</Table.Td>
                <Table.Td>{client.notes}</Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Group justify="center" gap="xs">
                    <Tooltip label="Editar">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => openEditModal(client)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {clients.length === 0 && (
          <Alert title="Sin clientes" color="blue" mt="md">
            No hay clientes registrados. Crea uno nuevo presionando el botón "Nuevo cliente".
          </Alert>
        )}
      </Paper>

      {/* Modal para crear/editar cliente */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar cliente" : "Crear cliente"}
      >
        <TextInput
          label="Nombre del cliente"
          placeholder="Ej: Juan Pérez"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          mb="sm"
        />

        <TextInput
          label="Teléfono"
          placeholder="Ej: +3102345679"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          mb="sm"
        />

        <TextInput
          label="Correo electrónico"
          placeholder="Ej: juan@example.com"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          mb="sm"
        />

        <Textarea
          label="Notas"
          placeholder="Información adicional..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          mb="md"
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveClient}>
            {editingId ? "Guardar cambios" : "Crear cliente"}
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
