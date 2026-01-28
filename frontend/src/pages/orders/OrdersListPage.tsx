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
  Pagination, // ✅ nuevo
  Select,
  TextInput,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconX } from "@tabler/icons-react"; // ✅ NUEVO

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

  // ✅ PAGINACIÓN
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, pageSize]);

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
        setPage(1);
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ======================
     ELIMINAR SELECCIONADAS
  ====================== */
  const confirmDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/orders/${id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            let errMsg = "No se pudieron eliminar las órdenes";
            try {
              const json = await res.json();
              if (json && json.message) errMsg = json.message;
            } catch (e) { }
            throw new Error(errMsg);
          }

          return id;
        })
      );

      setOrders((prev) => prev.filter((o) => !selectedIds.includes(o.id)));

      notifications.show({
        title: "Órdenes eliminadas",
        message: "Las órdenes fueron eliminadas correctamente",
        color: "green",
      });

      setSelectedIds([]);
      setOpened(false);
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err?.message || "No se pudieron eliminar las órdenes",
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

  // ✅ BUSCADOR: helper normalizador (ORD-0007, ord0007, etc.)
  function normalizeText(v: any) {
    return String(v ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "");
  }

  // ✅ BUSCADOR: lista filtrada (antes de paginar)
  const filteredOrders = search.trim()
    ? orders.filter((o) => {
      const q = search.trim().toLowerCase();
      const qNorm = normalizeText(q);

      const fieldsRaw = [
        o.order_number,
        o.nit,
        o.client_name,
        o.creation_date,
        o.estimated_delivery_date,
        (() => {
          // ✅ agrega también creation_date en formato DD/MM/YYYY
          if (!o.creation_date) return "";
          const [y, m, d] = o.creation_date.split("-").map(Number);
          return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
        })(),
        (() => {
          // ✅ agrega también estimated_delivery_date en formato DD/MM/YYYY
          if (!o.estimated_delivery_date) return "";
          const [y, m, d] = o.estimated_delivery_date.split("-").map(Number);
          return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
        })(),

        o.id,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      if (fieldsRaw.some((f) => f.includes(q))) return true;

      const fieldsNorm = fieldsRaw.map((v) => normalizeText(v));
      return fieldsNorm.some((f) => f.includes(qNorm));
    })
    : orders;


  // ✅ PAGINACIÓN: cálculo de páginas y órdenes visibles
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);


  /* ======================
     RENDER
  ====================== */
  return (
    <>
      <Title order={3} mb="md">
        Todas las Órdenes
      </Title>

      <TextInput
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        placeholder="Buscar: orden, NIT, cliente o fecha..."
        leftSection={<IconSearch size={16} />}
        rightSection={
          search ? (
            <IconX
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() => setSearch("")}
            />
          ) : null
        }
        mb="md"
        w={380}
      />


      {selectedIds.length > 0 && (
        <Group mb="md">
          <Button color="red" onClick={() => setOpened(true)}>
            Eliminar seleccionadas ({selectedIds.length})
          </Button>
        </Group>
      )}

      {filteredOrders.length === 0 ? (
        <Text>
          {orders.length === 0
            ? "No hay órdenes registradas."
            : "No hay resultados para esa búsqueda."}
        </Text>
      ) : (

        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {pagedOrders.map((order) => (
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
                onClick={() => navigate(`/dashboard/orders/Detail/${order.id}`)}
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
                    ? (() => {
                      const [y, m, d] = order.creation_date
                        .split("-")
                        .map(Number);
                      return new Date(y, m - 1, d).toLocaleDateString("es-CO");
                    })()
                    : "-"}
                </Text>

                <Text size="sm">
                  <strong>Entrega estimada:</strong>{" "}
                  {order.estimated_delivery_date
                    ? (() => {
                      const [y, m, d] = order.estimated_delivery_date
                        .split("-")
                        .map(Number);
                      return new Date(y, m - 1, d).toLocaleDateString("es-CO");
                    })()
                    : "-"}
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

          {/* ✅ PAGINACIÓN BONITA */}
          <Group justify="space-between" mt="lg" align="center" wrap="wrap">
            <Text size="sm" c="dimmed">
              Mostrando {filteredOrders.length === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + pageSize, filteredOrders.length)} de {filteredOrders.length}
            </Text>

            <Group gap="sm">
              <Select
                value={String(pageSize)}
                onChange={(v) => {
                  const newSize = Number(v || 12);
                  setPageSize(newSize);
                  setPage(1);
                }}
                data={["10", "20", "30", "40", "50"].map((v) => ({
                  value: v,
                  label: `${v} / página`,
                }))}
                w={140}
                size="sm"
              />

              <Pagination
                value={safePage}
                onChange={setPage}
                total={totalPages}
                radius="xl"
                size="sm"
                withEdges
              />
            </Group>
          </Group>
        </>
      )}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="¿Eliminar órdenes?"
        centered
      >
        <Text mb="md">
          ¿Estás seguro de eliminar <strong>{selectedIds.length}</strong> órdenes?
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
