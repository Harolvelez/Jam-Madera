import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  SimpleGrid,
  Loader,
  Center,
  Button,
  Group,
  Modal,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";

type Order = {
  id: number;
  order_number: string;
  client_name: string | null;
  nit: string | null;
  estimated_delivery_date: string | null;
};

export default function OrdersListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔴 Estado para eliminar
  const [opened, setOpened] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    setLoading(true);

    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar órdenes");
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "No se pudieron cargar las órdenes",
          color: "red",
          autoClose: 4000,
        });
        setLoading(false);
      });
  }, [location.key]);

  // 🗑️ Abrir modal
  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setOpened(true);
  };

  // ✅ Confirmar eliminación (por ahora solo front)
  const confirmDelete = async () => {
  if (!orderToDelete) return;

  try {
    const res = await fetch(`/api/orders/${orderToDelete.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error();

    setOrders((prev) =>
      prev.filter((o) => o.id !== orderToDelete.id)
    );

    notifications.show({
      title: "Orden eliminada",
      message: "La orden fue eliminada correctamente",
      color: "green",
    });

    setOpened(false);
    setOrderToDelete(null);
  } catch {
    notifications.show({
      title: "Error",
      message: "No se pudo eliminar la orden",
      color: "red",
    });
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
    <>
      <Title order={3} mb="md">Todas las Órdenes</Title>

      {orders.length === 0 ? (
        <Text>No hay órdenes registradas.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {orders.map((order) => (
            <Card
              key={order.id}
              withBorder
              shadow="sm"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(`/dashboard/orders/Detail/${order.id}`)
              }
            >
              <Title order={5}>{order.order_number}</Title>

              <Text size="sm">
                <strong>Cliente:</strong> {order.client_name || "-"}
              </Text>

              <Text size="sm">
                <strong>NIT:</strong> {order.nit || "-"}
              </Text>

              <Text size="sm">
                <strong>Entrega estimada:</strong>{" "}
                {order.estimated_delivery_date || "-"}
              </Text>

              {/* 🔘 BOTONES */}
              <Group mt="md" grow>
                <Button
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/orders/edit/${order.id}`);
                  }}
                >
                  Editar
                </Button>

                <Button
                  color="red"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(order);
                  }}
                >
                  Eliminar
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* 🪟 MODAL CONFIRMACIÓN */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="¿Eliminar orden?"
        centered
      >
        <Text mb="md">
          ¿Estás seguro de eliminar la orden{" "}
          <strong>{orderToDelete?.order_number}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)}>
            No
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Sí, eliminar
          </Button>
        </Group>
      </Modal>
    </>
  );
}
