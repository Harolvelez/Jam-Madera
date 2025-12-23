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
  Checkbox,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";

type Order = {
  id: number;
  order_number: string;
  client_name: string | null;
  nit: string | null;
  creation_date: string | null;
  estimated_delivery_date: string | null;
};

export default function OrdersListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token"); // ✅ AÑADIDO

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [opened, setOpened] = useState(false);

  /* ======================
     CARGAR ÓRDENES
  ====================== */
  useEffect(() => {
    setLoading(true);

    fetch("/api/orders", {
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
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "No se pudieron cargar las órdenes",
          color: "red",
        });
        setLoading(false);
      });
  }, [location.key, token]);

  /* ======================
     SELECCIÓN
  ====================== */
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  /* ======================
     ELIMINAR SELECCIONADAS
  ====================== */
  const confirmDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/orders/${id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`, // ✅ AÑADIDO
            },
          })
        )
      );

      setOrders((prev) =>
        prev.filter((o) => !selectedIds.includes(o.id))
      );

      notifications.show({
        title: "Órdenes eliminadas",
        message: "Las órdenes fueron eliminadas correctamente",
        color: "green",
      });

      setSelectedIds([]);
      setOpened(false);
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudieron eliminar las órdenes",
        color: "red",
      });
    }
  };

  /* ======================
     LOADING
  ====================== */
  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  /* ======================
     RENDER
  ====================== */
  return (
    <>
      <Title order={3} mb="md">
        Todas las Órdenes
      </Title>

      {selectedIds.length > 0 && (
        <Group mb="md">
          <Button color="red" onClick={() => setOpened(true)}>
            Eliminar seleccionadas ({selectedIds.length})
          </Button>
        </Group>
      )}

      {orders.length === 0 ? (
        <Text>No hay órdenes registradas.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {orders.map((order) => (
            <Card
              key={order.id}
              withBorder
              shadow="sm"
              style={{
                cursor: "pointer",
                border: selectedIds.includes(order.id)
                  ? "2px solid #4caf50"
                  : undefined,
              }}
              onClick={() =>
                navigate(`/dashboard/orders/Detail/${order.id}`)
              }
            >
              <Group justify="space-between" mb="xs">
                <div
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.includes(order.id)}
                    onChange={() => toggleSelect(order.id)}
                  />
                </div>

                <Title order={5}>{order.order_number}</Title>
              </Group>

              <Text size="sm">
                <strong>Cliente:</strong> {order.client_name || "-"}
              </Text>

              <Text size="sm">
                <strong>NIT:</strong> {order.nit || "-"}
              </Text>

              <Text size="sm">
                <strong>Fecha de creación:</strong>{" "}
                {order.creation_date
                  ? new Date(order.creation_date).toLocaleDateString("es-CO")
                  : "-"}
              </Text>

              <Text size="sm">
                <strong>Entrega estimada:</strong>{" "}
                {order.estimated_delivery_date || "-"}
              </Text>

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
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="¿Eliminar órdenes?"
        centered
      >
        <Text mb="md">
          ¿Estás seguro de eliminar{" "}
          <strong>{selectedIds.length}</strong> órdenes?
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
