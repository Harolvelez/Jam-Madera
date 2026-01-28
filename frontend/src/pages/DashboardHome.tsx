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
  Stack,
  RingProgress,
  Progress,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconUsers,
  IconFileText,
  IconClock,
  IconAlertTriangle,
  IconTrendingUp,
  IconChecks,
  IconPackage,
  IconCalendar,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

type Order = {
  id: number;
  status_id: number;
  estimated_delivery_date: string | null;
  creation_date: string | null;
  ingreso_type: string | null;
  metodo_pago: string | null;
};

type OrderStatus = {
  id: number;
  name: string;
  orders: Order[];
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);

  // ✅ NUEVO: redirección por rol al entrar al dashboard
  useEffect(() => {
    if (!token) return;

    let roleId = 0;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      roleId = Number(
        u?.role_id ||
        u?.roleId ||
        u?.rol_id ||
        u?.id_rol ||
        u?.rol ||
        u?.role ||
        0
      );
    } catch {
      roleId = 0;
    }

    // Ventas = 3 -> crear orden
    if (roleId === 3) {
      navigate("/dashboard/orders/CreateOrder", { replace: true });
      return;
    }

    // Producción = 4 -> estados
    if (roleId === 4) {
      navigate("/dashboard/ordenes/estados", { replace: true });
      return;
    }
  }, [token, navigate]);


  useEffect(() => {
    const load = async () => {
      const [u, board] = await Promise.all([
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders/board", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (u.ok) setUsers((await u.json()).length);
      if (board.ok) {
        const boardData = await board.json();
        setStatuses(boardData);

        // Extraer todas las órdenes de todos los estados
        const allOrders = boardData.flatMap((status: OrderStatus) => status.orders || []);
        setOrders(allOrders);
      }

      setLoading(false);
    };

    load();
  }, [token]);

  if (loading) {
    return (
      <Center mt="xl">
        <Loader size="xl" />
      </Center>
    );
  }

  // ==========================================
  // MÉTRICAS CALCULADAS
  // ==========================================

  // Estados
  const creadas = statuses.find(s => s.name === "creado")?.orders.length || 0;
  const enProduccion = statuses.find(s => s.name === "producción")?.orders.length || 0;
  const enPintura = statuses.find(s => s.name === "pintura")?.orders.length || 0; // ✅ NUEVO
  const terminadas = statuses.find(s => s.name === "terminado")?.orders.length || 0;
  const enInstalacion = statuses.find(s => s.name === "instalacion")?.orders.length || 0; // ✅ NUEVO
  const finalizadas = statuses.find(s => s.name === "finalizado")?.orders.length || 0;


  const entregadoIds = new Set<number>(
    statuses
      .filter((s) => ["finalizado", "entregado"].includes((s.name ?? "").toLowerCase()))
      .map((s) => s.id)
  );

  const totalOrdenes = orders.length;
  const ordenesPendientes = statuses
    .filter((s) => !entregadoIds.has(s.id))
    .reduce((acc, s) => acc + (s.orders?.length ?? 0), 0);
  // Todo lo que no esté finalizado

  // Órdenes atrasadas (fecha estimada < hoy y no finalizadas)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  // Fecha de hoy en formato YYYY-MM-DD (local, sin UTC)
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  const atrasadas = orders.filter((o) => {
    if (!o.estimated_delivery_date) return false;
    if (entregadoIds.has(o.status_id)) return false; // ✅ si está finalizado/entregado no cuenta
    return o.estimated_delivery_date < hoyStr;
  }).length;

  // Órdenes por entregar hoy
  const paraHoy = orders.filter((o) => {
    if (!o.estimated_delivery_date) return false;
    if (entregadoIds.has(o.status_id)) return false; // ✅ si está finalizado/entregado no cuenta
    return o.estimated_delivery_date === hoyStr;
  }).length;


  // Órdenes de esta semana (creadas esta semana)
  const inicioSemana = new Date(hoy);
  const diaSemana = hoy.getDay();
  const diffToMonday = (diaSemana + 6) % 7;
  inicioSemana.setDate(hoy.getDate() - diffToMonday);
  const inicioSemanaStr = `${inicioSemana.getFullYear()}-${String(inicioSemana.getMonth() + 1).padStart(2, "0")}-${String(inicioSemana.getDate()).padStart(2, "0")}`;

  const estaSemana = orders.filter(o => {
    if (!o.creation_date) return false;
    // Comparar strings directamente
    return o.creation_date >= inicioSemanaStr;
  }).length;

  // Tipos de ingreso
  const facturas = orders.filter(o => o.ingreso_type === "Factura").length;
  const pedidos = orders.filter(o => o.ingreso_type === "Pedido").length;

  // Métodos de pago
  const pagoBanco = orders.filter(o => o.metodo_pago === "Banco").length;
  const pagoEfectivo = orders.filter(o => o.metodo_pago === "Efectivo").length;

  // Porcentajes
  const porcentajeFinalizadas = totalOrdenes > 0 ? Math.round((finalizadas / totalOrdenes) * 100) : 0;
  const porcentajeAtrasadas = ordenesPendientes > 0 ? Math.round((atrasadas / ordenesPendientes) * 100) : 0;

  // Color para ring progress
  const getRingColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 50) return "blue";
    if (percentage >= 30) return "orange";
    return "red";
  };

  return (
    <Stack gap="xl">
      {/* HEADER */}
      <Center>
        <Stack gap="xs" align="center">
          <Title order={1}>Panel de Control</Title>
          <Text c="dimmed" size="sm">
            Vista general de JAM Maderas
          </Text>
        </Stack>
      </Center>

      {/* KPIs PRINCIPALES */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        <Card
          withBorder
          padding="lg"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard/usuarios")}
        >
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Usuarios
              </Text>
              <Title order={2} mt="xs">
                {users}
              </Title>
            </div>
            <ThemeIcon size={60} radius="md" variant="light" color="blue">
              <IconUsers size={32} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card
          withBorder
          padding="lg"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard/orders/OrderList")}
        >
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Total Órdenes
              </Text>
              <Title order={2} mt="xs">
                {totalOrdenes}
              </Title>
            </div>
            <ThemeIcon size={60} radius="md" variant="light" color="cyan">
              <IconFileText size={32} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card
          withBorder
          padding="lg"
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate("/dashboard/ordenes/estados", {
              state: { preset: "today" },
            })
          }
        >
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Por Entregar Hoy
              </Text>
              <Title order={2} mt="xs" c="orange">
                {paraHoy}
              </Title>
            </div>
            <ThemeIcon size={60} radius="md" variant="light" color="orange">
              <IconCalendar size={32} />
            </ThemeIcon>
          </Group>
        </Card>


        <Card
          withBorder
          padding="lg"
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate("/dashboard/ordenes/estados", {
              state: { preset: "overdue" },
            })
          }
        >
          <Group justify="space-between">
            <div>
              <Text c="dimmed" size="sm" fw={500}>
                Atrasadas
              </Text>
              <Title order={2} mt="xs" c="red">
                {atrasadas}
              </Title>
            </div>
            <ThemeIcon size={60} radius="md" variant="light" color="red">
              <IconAlertTriangle size={32} />
            </ThemeIcon>
          </Group>
        </Card>

      </SimpleGrid>

      {/* GRÁFICAS DE PROGRESO */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder padding="lg">
          <Text fw={600} size="lg" mb="md">
            Órdenes Completadas
          </Text>
          <Center>
            <RingProgress
              size={200}
              thickness={20}
              sections={[
                { value: porcentajeFinalizadas, color: getRingColor(porcentajeFinalizadas) },
              ]}
              label={
                <Center>
                  <Stack gap={0} align="center">
                    <Text size="xl" fw={700}>
                      {porcentajeFinalizadas}%
                    </Text>
                    <Text size="xs" c="dimmed">
                      {finalizadas} de {totalOrdenes}
                    </Text>
                  </Stack>
                </Center>
              }
            />
          </Center>
        </Card>

        <Card withBorder padding="lg">
          <Text fw={600} size="lg" mb="md">
            Estado de Entregas
          </Text>
          <Stack gap="md" mt="lg">
            <Box>
              <Group justify="space-between" mb={5}>
                <Text size="sm">Órdenes a tiempo</Text>
                <Text size="sm" fw={500}>
                  {ordenesPendientes - atrasadas} de {ordenesPendientes}
                </Text>
              </Group>
              <Progress
                value={ordenesPendientes > 0 ? ((ordenesPendientes - atrasadas) / ordenesPendientes) * 100 : 0}
                color="green"
                size="lg"
              />
            </Box>

            <Box>
              <Group justify="space-between" mb={5}>
                <Text size="sm">Órdenes atrasadas</Text>
                <Text size="sm" fw={500} c="red">
                  {atrasadas} ({porcentajeAtrasadas}%)
                </Text>
              </Group>
              <Progress value={porcentajeAtrasadas} color="red" size="lg" />
            </Box>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* ESTADOS DE ÓRDENES */}
      <Card withBorder padding="lg">
        <Text fw={600} size="lg" mb="md">
          Órdenes por Estado
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
          <Box
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard/ordenes/estados")}
          >
            <Group gap="xs">
              <ThemeIcon size={40} radius="md" variant="light" color="purple">
                <IconPackage size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Creadas
                </Text>
                <Title order={3}>{creadas}</Title>
              </div>
            </Group>
          </Box>

          <Box
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard/ordenes/estados")}
          >
            <Group gap="xs">
              <ThemeIcon size={40} radius="md" variant="light" color="yellow">
                <IconClock size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  En Producción
                </Text>
                <Title order={3}>{enProduccion}</Title>
              </div>
            </Group>
          </Box>

          <Box
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard/ordenes/estados")}
          >
            <Group gap="xs">
              <ThemeIcon size={40} radius="md" variant="light" color="orange">
                <IconAlertTriangle size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Pintura
                </Text>
                <Title order={3}>{enPintura}</Title>
              </div>
            </Group>
          </Box>


          <Box
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard/ordenes/estados")}
          >
            <Group gap="xs">
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconChecks size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Terminadas
                </Text>
                <Title order={3}>{terminadas}</Title>
              </div>
            </Group>
          </Box>

          <Box
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard/ordenes/estados")}
          >
            <Group gap="xs">
              <ThemeIcon size={40} radius="md" variant="light" color="indigo">
                <IconClock size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Instalación
                </Text>
                <Title order={3}>{enInstalacion}</Title>
              </div>
            </Group>
          </Box>


          <Box
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard/ordenes/estados")}
          >
            <Group gap="xs">
              <ThemeIcon size={40} radius="md" variant="light" color="green">
                <IconTrendingUp size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">
                  Finalizadas
                </Text>
                <Title order={3}>{finalizadas}</Title>
              </div>
            </Group>
          </Box>
        </SimpleGrid>
      </Card>

      {/* MÉTRICAS ADICIONALES */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Card withBorder padding="lg">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Nuevas esta semana
            </Text>
            <Badge color="cyan" variant="light">
              {estaSemana}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            Órdenes creadas desde el lunes
          </Text>
        </Card>

        <Card withBorder padding="lg">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Facturas vs Pedidos
            </Text>
          </Group>
          <Group gap="xs">
            <Badge color="blue" variant="filled">
              Facturas: {facturas}
            </Badge>
            <Badge color="grape" variant="filled">
              Pedidos: {pedidos}
            </Badge>
          </Group>
        </Card>

        <Card withBorder padding="lg">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Métodos de Pago
            </Text>
          </Group>
          <Group gap="xs">
            <Badge color="teal" variant="filled">
              Banco: {pagoBanco}
            </Badge>
            <Badge color="lime" variant="filled">
              Efectivo: {pagoEfectivo}
            </Badge>
          </Group>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
