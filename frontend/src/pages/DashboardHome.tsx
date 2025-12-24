import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Card,
  SimpleGrid,
  Group,
  Center,
  Loader,
  Badge,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

type Order = {
  id: number;
  status_id: number;
  estimated_delivery_date: string | null;
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      const [u, o] = await Promise.all([
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (u.ok) setUsers((await u.json()).length);
      if (o.ok) setOrders(await o.json());

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  // métricas
  const pendientes = orders.filter(o => o.status_id === 1).length;
  const proceso = orders.filter(o => o.status_id === 2).length;
  const entregadas = orders.filter(o => o.status_id === 3).length;

  const hoy = new Date().toISOString().slice(0, 10);
  const atrasadas = orders.filter(
    o => o.estimated_delivery_date && o.estimated_delivery_date < hoy && o.status_id !== 3
  ).length;

  return (
    <>
      <Center mb="xl">
        <Title order={2}>Bienvenido al Dashboard</Title>
      </Center>

      {/* KPIs */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        <Card withBorder onClick={() => navigate("/dashboard/usuarios")}>
          <Text c="dimmed">Usuarios</Text>
          <Title>{users}</Title>
        </Card>

        <Card withBorder onClick={() => navigate("/dashboard/orders/OrderList")}>
          <Text c="dimmed">Órdenes</Text>
          <Title>{orders.length}</Title>
        </Card>

        <Card withBorder>
          <Text c="dimmed">Pendientes</Text>
          <Title c="orange">{pendientes}</Title>
        </Card>

        <Card withBorder>
          <Text c="dimmed">Atrasadas</Text>
          <Title c="red">{atrasadas}</Title>
        </Card>
      </SimpleGrid>

      {/* ESTADOS */}
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder>
          <Group justify="space-between">
            <Text>Pendientes</Text>
            <Badge color="orange">{pendientes}</Badge>
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <Text>En proceso</Text>
            <Badge color="blue">{proceso}</Badge>
          </Group>
        </Card>

        <Card withBorder>
          <Group justify="space-between">
            <Text>Entregadas</Text>
            <Badge color="green">{entregadas}</Badge>
          </Group>
        </Card>
      </SimpleGrid>
    </>
  );
}