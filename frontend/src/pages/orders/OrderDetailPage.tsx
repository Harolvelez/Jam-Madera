import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Card,
  Table,
  Loader,
  Badge,
  Divider,
  Center,
  SimpleGrid,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";

/* =========================
   TIPOS
========================= */
type OrderItem = {
  id: number;
  description: string;
  quantity: number;
  width: number;
  height: number;
  length: number;
};

type Order = {
  id: number;
  order_number: string;
  nit: string | null;
  client_name: string | null;
  estimated_delivery_date: string | null;
  items: OrderItem[];
};

/* =========================
   COMPONENTE
========================= */
export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();

  if (!id || isNaN(Number(id))) {
    return <Text>Orden no válida</Text>;
  }

  /* ---------- Cargar orden ---------- */
  useEffect(() => {
    setLoading(true);

    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al cargar la orden");
        }
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
  }, [id]);

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
      <Title order={3} mb="xs">
        Orden {order.order_number}
      </Title>


      {/* DATOS PRINCIPALES */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
        <Card withBorder>
          <Text>
            <strong>Cliente:</strong>{" "}
            {order.client_name || "-"}
          </Text>
          <Text>
            <strong>NIT:</strong>{" "}
            {order.nit || "-"}
          </Text>
        </Card>

        <Card withBorder>
          <Text>
            <strong>Entrega estimada:</strong>{" "}
            {order.estimated_delivery_date || "-"}
          </Text>
        </Card>
      </SimpleGrid>

      <Divider my="md" label="Items de la orden" />

      {/* TABLA DESKTOP */}
      <Table
        striped
        highlightOnHover
        withTableBorder
        visibleFrom="sm"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Descripción</Table.Th>
            <Table.Th>Cantidad</Table.Th>
            <Table.Th>Ancho</Table.Th>
            <Table.Th>Alto</Table.Th>
            <Table.Th>Largo</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {order.items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>{item.description}</Table.Td>
              <Table.Td>{item.quantity}</Table.Td>
              <Table.Td>{item.width}</Table.Td>
              <Table.Td>{item.height}</Table.Td>
              <Table.Td>{item.length}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* MOBILE STACK */}
      <SimpleGrid
        cols={1}
        spacing="sm"
        hiddenFrom="sm"
      >
        {order.items.map((item) => (
          <Card key={item.id} withBorder>
            <Text>
              <strong>Descripción:</strong>{" "}
              {item.description}
            </Text>
            <Text>
              <strong>Cantidad:</strong>{" "}
              {item.quantity}
            </Text>
            <Text>
              <strong>Ancho:</strong>{" "}
              {item.width}
            </Text>
            <Text>
              <strong>Alto:</strong>{" "}
              {item.height}
            </Text>
            <Text>
              <strong>Largo:</strong>{" "}
              {item.length}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
