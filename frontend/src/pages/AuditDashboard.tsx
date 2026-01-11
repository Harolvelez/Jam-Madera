import { useEffect, useMemo, useState } from "react";
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
  Checkbox,
  Modal,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { fetchAudit, deleteAuditHistory } from "../services/audit.service";
import { fetchUsers } from "../services/users.service";
import { searchOrders } from "../services/orders.service";
import type { AuditItem } from "../types/audit";

/**
 * ✅ Helper: lee el usuario logueado desde localStorage
 * (ajústalo si tú lo guardas con otra key)
 */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

/**
 * ✅ Helper: convierte Date -> YYYY-MM-DD para backend
 */

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
     Fechas
  ====================== */
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  /* =====================
     ✅ Selección (checkbox)
  ====================== */
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ Permisos: solo administrador/gerente
  const user = getCurrentUser();
  const canDelete =
    user?.role === "administrador" ||
    user?.role === "gerente" ||
    user?.role_id === 1 ||
    user?.role_id === 2;

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

      // ✅ Cuando carga una nueva búsqueda/página, limpiamos selección
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* =====================
     ✅ Seleccionar todo (solo la página visible)
  ====================== */
  const allVisibleIds = useMemo(() => data.map((x) => x.id), [data]);

  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.includes(id)) && !allSelected;

  function toggleSelectAllVisible(checked: boolean) {
    if (checked) {
      setSelectedIds(allVisibleIds);
    } else {
      setSelectedIds([]);
    }
  }

  function toggleRow(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((x) => x !== id);
    });
  }

  /* =====================
     ✅ Eliminar seleccionados
  ====================== */
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return;

    setDeleting(true);
    try {
      await deleteAuditHistory(selectedIds); // ✅ backend
      setConfirmOpen(false);
      // recargar datos
      await loadData();
    } finally {
      setDeleting(false);
    }
  }

  /* =====================
     Render
  ====================== */
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md" align="center">
        <Title order={3}>Auditoría de Estados</Title>

        {/* ✅ Acciones admin/gerente */}
        {canDelete && (
          <Group>
            <Button
              color="red"
              variant="light"
              disabled={selectedIds.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Eliminar seleccionados ({selectedIds.length})
            </Button>
          </Group>
        )}
      </Group>

      {/* 🔍 Filtros */}
      <Group mb="md" align="end" wrap="wrap">
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
            const found = orderOptions.find((o) => o.order_number === value);
            setSelectedOrderId(found ? String(found.id) : null);
          }}
        />

        <DateInput label="Desde" value={from} onChange={setFrom} clearable />
        <DateInput label="Hasta" value={to} onChange={setTo} clearable />

        <Button
          onClick={() => {
            setPage(1);
            loadData();
          }}
        >
          Filtrar
        </Button>

        {canDelete && (
          <Checkbox
            label="Seleccionar todo (página)"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => toggleSelectAllVisible(e.currentTarget.checked)}
          />
        )}
      </Group>

      {/* 📊 Tabla */}
      {loading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {/* ✅ Columna selección solo para admin/gerente */}
              {canDelete && <Table.Th style={{ width: 60 }}>Sel.</Table.Th>}

              <Table.Th>Fecha</Table.Th>
              <Table.Th>Orden</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Usuario</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr key={row.id}>
                {canDelete && (
                  <Table.Td>
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => toggleRow(row.id, e.currentTarget.checked)}
                    />
                  </Table.Td>
                )}

                <Table.Td>{new Date(row.changed_at).toLocaleString()}</Table.Td>
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

      {/* ✅ Modal confirmación */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar eliminación"
        centered
      >
        <Text mb="sm">
          Vas a eliminar <b>{selectedIds.length}</b> registros de auditoría.
        </Text>

        <Text c="dimmed" size="sm" mb="md">
          Esta acción es <b>irreversible</b>. ¿Seguro que deseas continuar?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>

          <Button
            color="red"
            loading={deleting}
            onClick={handleDeleteSelected}
          >
            Sí, eliminar
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}
