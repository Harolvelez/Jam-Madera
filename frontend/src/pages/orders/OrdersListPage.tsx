import { useEffect, useState } from "react";
import { Card, Title, Text, SimpleGrid, Loader, Center } from "@mantine/core";
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
              onClick={() => navigate(`/dashboard/orders/Detail/${order.id}`)
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
                <strong>Entrega estimada:</strong> {order.estimated_delivery_date || "-"}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </>
  );
}
