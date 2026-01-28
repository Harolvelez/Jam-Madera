import {
  Text,
  Loader,
  Paper,
  Badge,
  Group,
  Stack,
  Grid,
  Divider,
  Indicator,
  Select,
} from "@mantine/core";
import { Calendar, DatesProvider } from "@mantine/dates";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { fetchOrdersCalendar } from "../services/calendar.service";

dayjs.locale("es");

type CalendarData = Record<string, any[]>;

export default function OrdersCalendar() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(false);

  // ✅ filtro por estado
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Cargar mes inicial
  useEffect(() => {
    loadMonth(currentMonth);
  }, []);

  // Recargar cuando cambia el mes
  const handleMonthChange = (date: string) => {
    const newMonth = new Date(date);
    setCurrentMonth(newMonth);
    loadMonth(newMonth);
  };

  // Normalizar clave YYYY-MM-DD usando componentes de Date (evita offsets UTC)
  const dateToKey = (d: string | Date) => {
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Convertir clave YYYY-MM-DD a Date construida por componentes (evita parsing ISO)
  const keyToDate = (key: string) => {
    const [y, m, d] = key.split("-").map((v) => parseInt(v, 10));
    return new Date(y, (m || 1) - 1, d || 1);
  };

  async function loadMonth(date: Date) {
    setLoading(true);
    try {
      const res = await fetchOrdersCalendar(date.getFullYear(), date.getMonth() + 1);
      setData(res.days || {});
    } finally {
      setLoading(false);
    }
  }

  // Obtener órdenes para un día específico
  const getOrdersForDay = (dateLike: string | Date) => {
    const key = dateToKey(dateLike);
    return data[key] ?? [];
  };

  // ✅ órdenes del día seleccionado
  const selectedOrders = useMemo(() => {
    if (!selectedDay) return [];
    return getOrdersForDay(selectedDay);
  }, [selectedDay, data]);

  // ✅ opciones del select (solo estados que existen en ese día)
  const statusOptions = useMemo(() => {
    const unique = Array.from(
      new Set(
        selectedOrders.map((o) => String(o.status ?? "").trim()).filter(Boolean)
      )
    ).sort();

    return [{ value: "all", label: "Todos" }, ...unique.map((s) => ({ value: s, label: s }))];
  }, [selectedOrders]);

  // ✅ aplicar filtro
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return selectedOrders;
    return selectedOrders.filter((o) => String(o.status ?? "").trim() === statusFilter);
  }, [selectedOrders, statusFilter]);

  // =========================
  // ✅ COLORES POR ESTADO (como export)
  // =========================
  const statusColorHex: Record<string, string> = {
    creado: "#D9C2E9",
    producción: "#FFF2CC",
    produccion: "#FFF2CC", // por si llega sin tilde
    pintura: "#ffb41e",    // ✅ tu color
    terminado: "#9DC3E6",
    instalacion: "#00cdb4", // ✅ tu color (sin tilde)
    instalación: "#00cdb4", // por si llega con tilde
    entregado: "#C6EFCE",
    finalizado: "#C6EFCE", // por si en algún lado llega así
  };

  function getStatusKey(status: any) {
    return String(status ?? "").trim().toLowerCase();
  }

  function getBadgeStyleByStatus(status: any) {
    const key = getStatusKey(status);
    const bg = statusColorHex[key];

    // fallback si no existe el estado
    if (!bg) {
      return {
        root: {
          backgroundColor: "rgba(34, 139, 230, 0.12)",
          border: "1px solid rgba(34, 139, 230, 0.25)",
          color: "#1c7ed6",
        },
      };
    }

    // texto oscuro para fondos claros, blanco para fondos fuertes (pintura/instalación)
    const isStrong = key === "pintura" || key === "instalacion" || key === "instalación";
    return {
      root: {
        backgroundColor: isStrong ? bg : `${bg}66`, // si es suave, la dejamos translúcida
        border: `1px solid ${bg}`,
        color: isStrong ? "#ffffff" : "#1f2937",
        fontWeight: 700,
      },
    };
  }

  return (
    <DatesProvider settings={{ locale: "es" }}>
      <Paper p="lg" withBorder radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">
              📅 Calendario de Entregas
            </Text>
            {loading && <Loader size="sm" />}
          </Group>

          <Divider />

          <Grid>
            {/* Calendario */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Calendar
                firstDayOfWeek={1}
                getDayProps={(date) => {
                  const key = dateToKey(date);
                  const dateObj = keyToDate(key);
                  return {
                    selected: selectedDay === key,
                    onClick: () => {
                      console.debug("Calendar click", { date, dateObj: dateObj.toString(), key });
                      setSelectedDay(key);
                      setStatusFilter("all"); // reset filtro al cambiar día
                    },
                  };
                }}
                onNextMonth={handleMonthChange}
                onPreviousMonth={handleMonthChange}
                renderDay={(date) => {
                  const key = dateToKey(date);
                  const orders = getOrdersForDay(key);
                  const day = keyToDate(key).getDate();

                  return (
                    <Indicator
                      disabled={orders.length === 0}
                      label={orders.length}
                      size={16}
                      color="blue"
                      offset={5}
                      style={{ zIndex: 1 }}
                    >
                      <div>{day}</div>
                    </Indicator>
                  );
                }}
              />
            </Grid.Col>

            {/* Detalle del día */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="md" radius="md" mih={350}>
                {!selectedDay ? (
                  <Stack align="center" justify="center" h="100%">
                    <Text size="sm" c="dimmed" ta="center">
                      Selecciona un día del calendario
                      <br />
                      para ver sus órdenes
                    </Text>
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={600} size="lg">
                        {dayjs(keyToDate(selectedDay)).format("DD [de] MMMM, YYYY")}
                      </Text>

                      {/* total del día */}
                      <Badge size="lg" variant="light" color="blue">
                        {selectedOrders.length} órdenes
                      </Badge>
                    </Group>

                    <Divider />

                    {/* filtro por estado */}
                    <Select
                      label="Filtrar por estado"
                      value={statusFilter}
                      onChange={(v) => setStatusFilter(v || "all")}
                      data={statusOptions}
                      searchable
                      clearable
                    />

                    {selectedOrders.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center" py="xl">
                        No hay órdenes programadas
                      </Text>
                    ) : filteredOrders.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center" py="xl">
                        No hay órdenes con ese filtro
                      </Text>
                    ) : (
                      <Stack gap="sm">
                        {filteredOrders.map((order) => (
                          <Paper
                            key={order.id}
                            p="md"
                            withBorder
                            radius="md"
                            style={{
                              transition: "all 0.2s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                              e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <Group justify="space-between" wrap="nowrap">
                              <Stack gap={4}>
                                <Text size="sm" fw={600}>
                                  {order.order_number}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  👤 {order.client}
                                </Text>
                              </Stack>

                              {/* ✅ AHORA SÍ: color por estado */}
                              <Badge
                                variant="light"
                                size="md"
                                styles={getBadgeStyleByStatus(order.status)}
                              >
                                {order.status}
                              </Badge>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>
    </DatesProvider>
  );
}
