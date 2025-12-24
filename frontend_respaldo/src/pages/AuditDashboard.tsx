import { useEffect, useState } from "react";
import {
  Table,
  Paper,
  Title,
  Group,
  Button,
  Pagination,
  Loader,
  Select,
  Autocomplete,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { fetchAudit } from "../services/audit.service";
import { fetchUsers } from "../services/users.service";
import { searchOrders } from "../services/orders.service";
import type { AuditItem } from "../types/audit";

export default function AuditDashboard() {
  /* =====================
     Estados principales
  ====================== */
  const [data, setData] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* =====================
     Usuarios (Select)
  ====================== */
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  /* =====================
     Órdenes (Autocomplete)
  ====================== */
  const [orderSearch, setOrderSearch] = useState("");
  const [orderOptions, setOrderOptions] = useState<
    { id: number; order_number: string }[]
  >([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  /* =====================
     Fechas (Mantine 8)
  ====================== */
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  /* =====================
     Cargar usuarios
  ====================== */
  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  /* =====================
     Autocomplete órdenes
  ====================== */
  const handleOrderSearch = async (value: string) => {
    setOrderSearch(value);

    if (value.length < 2) {
      setOrderOptions([]);
      setSelectedOrderId(null);
      return;
    }

    const res = await searchOrders(value);
    setOrderOptions(res);
  };

  /* =====================
     Cargar auditoría
  ====================== */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAudit({
        order_id: selectedOrderId || undefined,
        changed_by: selectedUser || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
      });

      setData(res.data);
      setTotalPages(res.last_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  /* =====================
     Render
  ====================== */
  return (
    <Paper p="md" radius="md" withBorder>
      <Title order={3} mb="md">
        Auditoría de Estados
      </Title>

      {/* 🔍 Filtros */}
      <Group mb="md" align="end">
        <Select
          label="Usuario"
          placeholder="Todos"
          data={users.map((u) => ({
            value: String(u.id),
            label: u.name,
          }))}
          value={selectedUser}
          onChange={setSelectedUser}
          clearable
        />

        <Autocomplete
          label="Orden"
          placeholder="Buscar orden"
          value={orderSearch}
          onChange={handleOrderSearch}
          data={orderOptions.map((o) => o.order_number)}
          onOptionSubmit={(value) => {
            const found = orderOptions.find(
              (o) => o.order_number === value
            );
            setSelectedOrderId(found ? String(found.id) : null);
          }}
        />

        <DateInput
          label="Desde"
          value={from}
          onChange={setFrom}
          clearable
        />

        <DateInput
          label="Hasta"
          value={to}
          onChange={setTo}
          clearable
        />

        <Button
          onClick={() => {
            setPage(1);
            loadData();
          }}
        >
          Filtrar
        </Button>
      </Group>

      {/* 📊 Tabla */}
      {loading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Orden</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Usuario</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>
                  {new Date(row.changed_at).toLocaleString()}
                </Table.Td>
                <Table.Td>{row.order.order_number}</Table.Td>
                <Table.Td>{row.status.name}</Table.Td>
                <Table.Td>{row.user.name}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* 📄 Paginación */}
      <Group justify="center" mt="md">
        <Pagination value={page} onChange={setPage} total={totalPages} />
      </Group>
    </Paper>
  );
}
