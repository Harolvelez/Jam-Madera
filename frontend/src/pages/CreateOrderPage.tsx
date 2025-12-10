import { useState, useEffect } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Select,
  Group,
  NumberInput,
  Card,
  Divider,
  Alert,
  Modal,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

// 🔹 Tipo para los items
type OrderItem = {
  description: string;
  quantity: number;
  width: number;
  height: number;
  length: number;
};

export default function CreateOrderPage() {
  const navigate = useNavigate();

  // Datos de la orden
  const [orderNumber, setOrderNumber] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Lista de clientes
  const [clients, setClients] = useState<{ value: string; label: string }[]>([]);

  const [items, setItems] = useState<OrderItem[]>([
    { description: "", quantity: 1, width: 0, height: 0, length: 0 },
  ]);

  // Crear cliente
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar clientes
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/clients", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c: any) => ({
          value: c.id.toString(),
          label: c.name,
        }));
        setClients(formatted);
      })
      .catch(() => setError("No se pudieron cargar los clientes."));
  }, []);

  // Agregar item
  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, width: 0, height: 0, length: 0 },
    ]);
  };

  // Eliminar item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];

      const numericValue =
        typeof value === "number"
          ? value
          : value === "" || value === null
          ? 0
          : Number(value) || 0;

      updated[index] = {
        ...updated[index],
        [field]: numericValue,
      };

      return updated;
    });
  };



  // Guardar cliente
  const handleCreateClient = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear cliente");
      }

      setClients([
        ...clients,
        { value: String(data.client.id), label: data.client.name },
      ]);

      setClientId(String(data.client.id));
      setNewClient({ name: "", phone: "", email: "", notes: "" });
      setClientModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Guardar orden
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Debes iniciar sesión.");
      return;
    }

    const body = {
      order_number: orderNumber,
      client_id: Number(clientId),
      description,
      delivery_date: deliveryDate || null,
      items,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear la orden");
      }

      setSuccess("Orden creada correctamente");
      setTimeout(() => navigate("/dashboard/ordenes"), 1200);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Paper p="lg" radius="md" shadow="md">
      <Title order={2} mb="md">
        Crear nueva orden
      </Title>

      {error && <Alert color="red" mb="md">{error}</Alert>}
      {success && <Alert color="green" mb="md">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        
        <TextInput
          label="Número de orden"
          placeholder="Ej: ORD-001"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          mb="md"
        />

        <Group align="flex-end" mb="md">
          <Select
            label="Cliente"
            placeholder="Seleccione un cliente"
            data={clients}
            value={clientId}
            onChange={setClientId}
            required
            searchable
            style={{ flex: 1 }}
          />

          <Button variant="outline" onClick={() => setClientModalOpen(true)}>
            Nuevo cliente
          </Button>
        </Group>

        <Textarea
          label="Descripción general"
          placeholder="Ej: Pedido general de madera"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          mb="md"
        />

        <TextInput
          label="Fecha de entrega"
          placeholder="YYYY-MM-DD"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          mb="xl"
        />

        <Divider mb="xl" label="Items de la orden" labelPosition="center" />

        {items.map((item, index) => (
          <Card withBorder radius="md" p="md" mb="md" key={index}>
            <Group justify="space-between" mb="sm">
              <Title order={5}>Item #{index + 1}</Title>

              {items.length > 1 && (
                <Button
                  color="red"
                  size="xs"
                  onClick={() => removeItem(index)}
                  leftSection={<IconTrash size={14} />}
                >
                  Eliminar
                </Button>
              )}
            </Group>

            <TextInput
              label="Descripción del item"
              placeholder="Ej: Madera pino 2x4"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              required
              mb="sm"
            />

            <Group grow>
              <NumberInput
                label="Cantidad"
                min={1}
                value={item.quantity}
                onChange={(value) => updateItem(index, "quantity", value)}
              />

              <NumberInput
                label="Ancho (cm)"
                min={0}
                value={item.width}
                onChange={(value) => updateItem(index, "width", value)}
              />

              <NumberInput
                label="Alto (cm)"
                min={0}
                value={item.height}
                onChange={(value) => updateItem(index, "height", value)}
              />

              <NumberInput
                label="Largo (cm)"
                min={0}
                value={item.length}
                onChange={(value) => updateItem(index, "length", value)}
              />
            </Group>
          </Card>
        ))}

        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={addItem}
          mb="xl"
        >
          Añadir item
        </Button>

        <Button type="submit" size="md" fullWidth>
          Guardar Orden
        </Button>
      </form>

      <Modal
        opened={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        title="Crear cliente"
      >
        <TextInput
          label="Nombre del cliente"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          required
          mb="sm"
        />

        <TextInput
          label="Teléfono"
          value={newClient.phone}
          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          mb="sm"
        />

        <TextInput
          label="Correo"
          value={newClient.email}
          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          mb="sm"
        />

        <Textarea
          label="Notas"
          value={newClient.notes}
          onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
          mb="sm"
        />

        <Button fullWidth mt="md" onClick={handleCreateClient}>
          Guardar cliente
        </Button>
      </Modal>
    </Paper>
  );
}
