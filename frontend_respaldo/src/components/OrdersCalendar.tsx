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
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchOrdersCalendar } from "../services/calendar.service";

type CalendarData = Record<string, any[]>;

export default function OrdersCalendar() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(false);

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

  async function loadMonth(date: Date) {
    setLoading(true);
    try {
      const res = await fetchOrdersCalendar(
        date.getFullYear(),
        date.getMonth() + 1
      );
      setData(res.days || {});
    } finally {
      setLoading(false);
    }
  }

  // Obtener órdenes para un día específico
  const getOrdersForDay = (dateString: string) => {
    const key = dayjs(dateString).format("YYYY-MM-DD");
    return data[key] ?? [];
  };

  return (
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
              getDayProps={(date) => ({
                selected: selectedDay === date,
                onClick: () => setSelectedDay(date),
              })}
              onNextMonth={handleMonthChange}
              onPreviousMonth={handleMonthChange}
              renderDay={(date) => {
                const orders = getOrdersForDay(date);
                const day = new Date(date).getDate();

                return (
                  <Indicator
                    disabled={orders.length === 0}
                    label={orders.length}
                    size={16}
                    color="blue"
                    offset={5}
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
                      {dayjs(selectedDay).format("DD [de] MMMM, YYYY")}
                    </Text>
                    <Badge size="lg" variant="light" color="blue">
                      {getOrdersForDay(selectedDay).length} órdenes
                    </Badge>
                  </Group>

                  <Divider />

                  {getOrdersForDay(selectedDay).length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      No hay órdenes programadas
                    </Text>
                  ) : (
                    <Stack gap="sm">
                      {getOrdersForDay(selectedDay).map((order) => (
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
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0,0,0,0.1)";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
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
                            <Badge
                              variant="light"
                              size="md"
                              color={
                                order.status === "completed"
                                  ? "green"
                                  : order.status === "pending"
                                  ? "yellow"
                                  : "blue"
                              }
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
  );
}