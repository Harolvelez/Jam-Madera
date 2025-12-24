import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Card,
  Table,
  Loader,
  Divider,
  Center,
  SimpleGrid,
  Button,
  Group,
  Modal,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

/* =========================
   TIPOS
========================= */
type OrderItem = {
  id: number;
  description: string;
  quantity: number;
  width: number;
  calibre: number;
  length: number;
};

type Order = {
  id: number;
  order_number: string;
  nit: string | null;
  client_name: string | null;
  phone: string | null;
  email: string | null;
  ingreso_type: string | null;
  creation_date: string | null;
  estimated_delivery_date: string | null;
  items: OrderItem[];
};

/* =========================
   COMPONENTE
========================= */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // ✅ AÑADIDO

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [opened, setOpened] = useState(false);

  if (!id || isNaN(Number(id))) {
    return <Text>Orden no válida</Text>;
  }

  /* ---------- Cargar orden ---------- */
  useEffect(() => {
    setLoading(true);

    fetch(`/api/orders/${id}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // ✅ AÑADIDO
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "No se pudo cargar la orden",
          color: "red",
          autoClose: 4000,
        });
        setLoading(false);
      });
  }, [id, token]);

  /* ---------- Eliminar orden ---------- */
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // ✅ AÑADIDO
        },
      });

      if (!res.ok) throw new Error();

      notifications.show({
        title: "Orden eliminada",
        message: "La orden fue eliminada correctamente",
        color: "green",
      });

      navigate("/dashboard/orders/OrderList");
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo eliminar la orden",
        color: "red",
      });
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  if (!order) {
    return <Text>No se encontró la orden.</Text>;
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={3}>Orden {order.order_number}</Title>

        <Group>
          <Button
            variant="light"
            onClick={() =>
              navigate(`/dashboard/orders/edit/${order.id}`)
            }
          >
            Editar
          </Button>

          <Button
            color="red"
            variant="light"
            onClick={() => setOpened(true)}
          >
            Eliminar
          </Button>

          <Button
            color="green"
            onClick={() =>
              window.open(`/print/order/${order.id}`, "_blank")
            }
          >
            Imprimir
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
        <Card withBorder>
          <Text><strong>Cliente:</strong> {order.client_name || "-"}</Text>
          <Text><strong>NIT:</strong> {order.nit || "-"}</Text>
          <Text><strong>Teléfono:</strong> {order.phone || "-"}</Text>
          <Text><strong>Email:</strong> {order.email || "-"}</Text>
        </Card>

        <Card withBorder>
          <Text><strong>Tipo de ingreso:</strong> {order.ingreso_type || "-"}</Text>
          <Text>
            <strong>Fecha de creación:</strong>{" "}
            {order.creation_date
              ? new Date(order.creation_date).toLocaleDateString("es-CO")
              : "-"}
          </Text>
          <Text>
            <strong>Entrega estimada:</strong>{" "}
            {order.estimated_delivery_date
              ? new Date(order.estimated_delivery_date).toLocaleDateString("es-CO")
              : "-"}
          </Text>
        </Card>
      </SimpleGrid>

      <Divider my="md" label="Items de la orden" />

      <Table striped highlightOnHover withTableBorder visibleFrom="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Descripción</Table.Th>
            <Table.Th>Cantidad</Table.Th>
            <Table.Th>Ancho</Table.Th>
            <Table.Th>Largo</Table.Th>
            <Table.Th>Calibre</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {order.items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>{item.description}</Table.Td>
              <Table.Td>{item.quantity}</Table.Td>
              <Table.Td>{item.width}</Table.Td>
              <Table.Td>{item.length}</Table.Td>
              <Table.Td>{item.calibre}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <SimpleGrid cols={1} spacing="sm" hiddenFrom="sm">
        {order.items.map((item) => (
          <Card key={item.id} withBorder>
            <Text><strong>Descripción:</strong> {item.description}</Text>
            <Text><strong>Cantidad:</strong> {item.quantity}</Text>
            <Text><strong>Ancho:</strong> {item.width}</Text>
            <Text><strong>Largo:</strong> {item.length}</Text>
            <Text><strong>Calibre:</strong> {item.calibre}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Modal opened={opened} onClose={() => setOpened(false)} title="¿Eliminar orden?" centered>
        <Text mb="md">
          ¿Estás seguro de eliminar la orden{" "}
          <strong>{order.order_number}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)}>
            No
          </Button>
          <Button color="red" onClick={handleDelete}>
            Sí, eliminar
          </Button>
        </Group>
      </Modal>
    </>
  );
}