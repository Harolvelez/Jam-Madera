import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Card,
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
  numero_factura: string | null;
  metodo_pago: string | null;
  items: OrderItem[];
};

/* =========================
   COMPONENTE
========================= */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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
        Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
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
      {/* ENCABEZADO */}
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

      {/* DATOS GENERALES */}
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
          <Text><strong>Número de factura:</strong> {order.numero_factura || "-"}</Text>
          <Text><strong>Método de pago:</strong> {order.metodo_pago || "-"}</Text>
        </Card>
      </SimpleGrid>

      {/* ITEMS (TEXTO LIBRE) */}
      <Divider my="md" label="Items de la orden" />

      <Card withBorder>
        {order.items && order.items.length > 0 ? (
          <Text size="sm" style={{ whiteSpace: "pre-line" }}>
            {order.items
              .flatMap((it) => String(it.description ?? "").split("\n"))
              .map((line) =>
                line.trim().replace(/^\s*[•\-\*\u2022]\s*/g, "")
              )
              .filter(Boolean)
              .join("\n")}
          </Text>
        ) : (
          <Text size="sm">—</Text>
        )}
      </Card>

      {/* MODAL ELIMINAR */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="¿Eliminar orden?"
        centered
      >
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
