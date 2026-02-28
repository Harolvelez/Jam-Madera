
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";

import OrderCard from "../components/OrderCard";
import BoardColumn from "../components/BoardColumn";
import { getOrderBoard, moveOrder } from "../services/orders.service";


import {
  Box,
  Title,
  ScrollArea,
  Group,
  Button,
  Modal,
  Checkbox,
  Stack,
  TextInput,
  Text,
  Switch,
  Divider,
  Badge,
  Affix,
  Transition,
  Notification,
  Progress,
  ActionIcon,
  Paper,
} from "@mantine/core";


import { IconSearch, IconFilter, IconX, IconChevronUp } from "@tabler/icons-react";
import * as XLSX from "xlsx-js-style";

/**
 * ✅ Traducción visual de estados (BD queda igual)
 */
const statusLabel: Record<string, string> = {
  finalizado: "Entregado",
};

export default function EstadosOrdenes() {
  const location = useLocation();
  const presetApplied = useRef(false);

  const [board, setBoard] = useState<any[]>([]);

  // ✅ Sensores separados: MouseSensor para desktop, TouchSensor para móviles
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Desktop: requiere mover 8px antes de activar drag
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Móvil: requiere mantener presionado 800ms SIN moverse mucho
      // Si mueve el dedo >15px durante el delay, se cancela el drag (permite scroll)
      activationConstraint: {
        delay: 800,
        tolerance: 15,
      },
    })
  );

  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // =========================
  // ✅ Export Excel (modal)
  // =========================
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(""); // export
  const [endDate, setEndDate] = useState(""); // export
  // ✅ NUEVO: estado para progreso de exportación
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMsg, setExportMsg] = useState("");
  // ✅ NUEVO: notificación flotante (minimizar/expandir)
  const [exportToastMinimized, setExportToastMinimized] = useState(false);
  // ✅ NUEVO: muestra “Archivo listo” unos segundos
  const [exportDone, setExportDone] = useState(false);




  // =========================
  // ✅ Filtros tablero (modal)
  // =========================
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState<number[]>([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [onlyPendingDelivery, setOnlyPendingDelivery] = useState(false);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [hideEmptyColumns, setHideEmptyColumns] = useState(false);

  // ✅ Buscador del tablero
  const [search, setSearch] = useState("");

  // ✅ Para que los botones Hoy / Mañana / Semana se marquen como seleccionados
  const [activeQuick, setActiveQuick] = useState<
    "today" | "tomorrow" | "week" | null
  >(null);

  useEffect(() => {
    loadBoard();
  }, []);

  useEffect(() => {
    const preset = (location.state as any)?.preset;
    if (!preset) return;

    // ✅ para que no se aplique dos veces
    if (presetApplied.current) return;
    presetApplied.current = true;

    // ✅ primero limpia todo (así se aplica limpio)
    clearBoardFilters();

    if (preset === "overdue") {
      setOnlyOverdue(true); // ✅ activa "Solo vencidas"
    }

    if (preset === "today") {
      setQuickRange("today"); // ✅ solo filtra por hoy
    }
  }, [location.state, location.key]);



  async function loadBoard() {
    const data = await getOrderBoard();
    setBoard(data);
  }

  // =========================
  // ✅ Mover orden localmente (queda ARRIBA)
  // =========================
  function moveOrderLocally(orderId: number, fromStatusId: number, toStatusId: number) {
    setBoard((prev) => {
      const newBoard = structuredClone(prev);

      const fromColumn = newBoard.find((s: any) => s.id === fromStatusId);
      const toColumn = newBoard.find((s: any) => s.id === toStatusId);

      if (!fromColumn || !toColumn) return prev;

      const index = fromColumn.orders.findIndex((o: any) => o.id === orderId);
      if (index === -1) return prev;

      const [order] = fromColumn.orders.splice(index, 1);

      // ✅ La orden recién movida queda de PRIMERA
      toColumn.orders.unshift(order);

      return newBoard;
    });
  }

  function onDragStart(event: any) {
    const orderId = Number(event.active.id);

    for (const status of board) {
      const found = status.orders.find((o: any) => o.id === orderId);
      if (found) {
        setActiveOrder(found);
        break;
      }
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveOrder(null);
    if (!over) return;

    const orderId = Number(active.id);
    const newStatusId = Number(over.data.current?.statusId ?? over.id);
    const oldStatusId = active.data.current?.statusId;

    if (!oldStatusId || oldStatusId === newStatusId) return;

    moveOrderLocally(orderId, oldStatusId, newStatusId);

    try {
      await moveOrder(orderId, newStatusId);
    } catch {
      // Si falla, recargamos para "revertir"
      loadBoard();
    }
  }

  // =========================
  // ✅ HELPERS DE FECHA (ATAJOS)
  // =========================
  function toISODate(d: Date) {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function setQuickRange(type: "today" | "tomorrow" | "week") {
    // ✅ marca el atajo seleccionado para que el botón se vea activo
    setActiveQuick(type);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (type === "today") {
      setFilterStartDate(toISODate(now));
      setFilterEndDate(toISODate(now));
      return;
    }

    if (type === "tomorrow") {
      const t = new Date(now);
      t.setDate(t.getDate() + 1);
      setFilterStartDate(toISODate(t));
      setFilterEndDate(toISODate(t));
      return;
    }

    // ✅ Esta semana (Lunes -> Domingo)
    const day = now.getDay(); // 0 domingo ... 6 sábado
    const diffToMonday = (day + 6) % 7; // domingo(0)->6, lunes(1)->0 ...
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setFilterStartDate(toISODate(monday));
    setFilterEndDate(toISODate(sunday));
  }

  function clearDateRange() {
    setFilterStartDate("");
    setFilterEndDate("");
    setActiveQuick(null); // ✅ sin atajo seleccionado
  }

  // =========================
  // ✅ HELPERS DE FILTROS / BÚSQUEDA
  // =========================
  function isOrderOverdue(order: any, statusName?: string) {
    const key = (statusName ?? "").toLowerCase();

    // ✅ En Entregado/Finalizado NUNCA cuenta como vencida
    if (key === "finalizado" || key === "entregado") return false;

    if (!order.estimated_delivery_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deliveryDate = new Date(order.estimated_delivery_date + "T00:00:00");
    return deliveryDate < today;
  }

  /**
   * ✅ Verifica si una orden entregada tiene más de 30 días en esa columna
   * Si tiene más de 30 días, se oculta del tablero
   */
  function isDeliveredOrderTooOld(order: any, statusName: string) {
    // Solo aplica para la columna "finalizado" (que se muestra como "Entregado")
    const key = (statusName ?? "").toLowerCase();
    if (key !== "finalizado") return false;

    // Si tiene historial de último cambio de estado, usamos esa fecha
    const changedAt = order.last_status_history?.changed_at;
    if (!changedAt) return false; // Si no hay fecha, mostramos la orden

    const changedDate = new Date(changedAt);
    const today = new Date();
    const diffTime = today.getTime() - changedDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays > 30; // Si tiene más de 30 días, es "muy vieja"
  }

  function isOrderInRange(order: any) {
    // ✅ Si no hay filtro de fechas, pasa
    if (!filterStartDate && !filterEndDate) return true;

    // ✅ Si estás filtrando por fecha y NO tiene fecha estimada, no entra
    if (!order.estimated_delivery_date) return false;

    const d = new Date(order.estimated_delivery_date + "T00:00:00");

    if (filterStartDate) {
      const start = new Date(filterStartDate + "T00:00:00");
      if (d < start) return false;
    }

    if (filterEndDate) {
      const end = new Date(filterEndDate + "T23:59:59");
      if (d > end) return false;
    }

    return true;
  }

  // Normaliza texto para buscar tolerando guiones/espacios (ORD-0007, ord0007, etc.)
  function normalizeText(v: any) {
    return String(v ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "");
  }

  function matchesSearch(order: any) {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const qNorm = normalizeText(q);

    // ✅ Campos buscables
    const fieldsRaw = [
      order.order_number,
      order.nit,
      order.client_name,
      order.phone,
      order.email,
      order.numero_factura,
      order.metodo_pago,
      order.id, // por si buscas el ID
    ]
      .filter(Boolean)
      .map((v: any) => String(v).toLowerCase());

    // match normal
    if (fieldsRaw.some((f) => f.includes(q))) return true;

    // match normalizado (sin espacios/guiones)
    const fieldsNorm = fieldsRaw.map((v) => normalizeText(v));
    return fieldsNorm.some((f) => f.includes(qNorm));
  }

  // =========================
  // ✅ TABLERO FILTRADO (LO QUE SE VE)
  // =========================
  const viewBoard = useMemo(() => {
    const filtered = board
      .filter((status: any) => {
        // ✅ Filtrar por columnas seleccionadas (si seleccionan alguna)
        if (filterStatuses.length > 0 && !filterStatuses.includes(status.id)) {
          return false;
        }

        // ✅ Solo por entregar: oculta Entregado/Finalizado
        if (onlyPendingDelivery) {
          const key = (status.name ?? "").toLowerCase();
          if (key === "finalizado" || key === "entregado") return false;
        }

        return true;
      })
      .map((status: any) => {
        const orders = (status.orders ?? []).filter((order: any) => {
          if (!matchesSearch(order)) return false;
          if (!isOrderInRange(order)) return false;
          if (onlyOverdue && !isOrderOverdue(order, status.name)) return false;
          // ✅ Ocultar órdenes entregadas con más de 30 días
          if (isDeliveredOrderTooOld(order, status.name)) return false;
          return true;
        });

        return { ...status, orders };
      });

    // ✅ Ocultar columnas vacías
    if (hideEmptyColumns) {
      return filtered.filter((s: any) => (s.orders ?? []).length > 0);
    }

    return filtered;
  }, [
    board,
    filterStatuses,
    filterStartDate,
    filterEndDate,
    onlyPendingDelivery,
    onlyOverdue,
    hideEmptyColumns,
    search,
  ]);

  // =========================
  // ✅ INDICADOR: FILTROS ACTIVOS (contador)
  // =========================
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (search.trim()) c++; // búsqueda activa
    if (filterStartDate || filterEndDate) c++; // fechas
    if (filterStatuses.length > 0) c++; // columnas
    if (onlyPendingDelivery) c++;
    if (onlyOverdue) c++;
    if (hideEmptyColumns) c++;
    return c;
  }, [
    search,
    filterStartDate,
    filterEndDate,
    filterStatuses.length,
    onlyPendingDelivery,
    onlyOverdue,
    hideEmptyColumns,
  ]);

  const hasActiveFilters = activeFilterCount > 0;

  // =========================
  // ✅ EXPORT EXCEL
  // =========================
  async function exportToExcel() {
    // ✅ Evita doble clic
    if (exporting) return;

    setExporting(true);
    setExportDone(false);
    setExportProgress(0);
    setExportMsg("Preparando datos...");
    setExportToastMinimized(false);

    const ROWS_PER_SHEET = 50000;

    const statusColors: any = {
      creado: "D9C2E9",
      producción: "FFF2CC",
      pintura: "FFB41E",
      terminado: "9DC3E6",
      instalacion: "00CDB4",
      entregado: "C6EFCE",
    };

    const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

    try {
      // 1) Contar total exportable (para progreso real)
      let total = 0;

      for (const status of board) {
        if (!selectedStatuses.includes(status.id)) continue;

        for (const order of status.orders || []) {
          if (order.estimated_delivery_date) {
            const deliveryDate = new Date(order.estimated_delivery_date + "T00:00:00");

            if (startDate) {
              const start = new Date(startDate + "T00:00:00");
              if (deliveryDate < start) continue;
            }

            if (endDate) {
              const end = new Date(endDate + "T23:59:59");
              if (deliveryDate > end) continue;
            }
          }
          total++;
        }
      }

      if (total === 0) {
        alert("No hay órdenes para exportar con esos filtros.");
        return;
      }

      setExportMsg(`Generando Excel (${total} filas)...`);
      setExportProgress(1);

      // 2) Crear workbook y armar por hojas
      const workbook = XLSX.utils.book_new();

      let sheetIndex = 1;
      let chunkRows: any[] = [];
      let processed = 0;

      const flushChunkToSheet = async () => {
        if (chunkRows.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(chunkRows);

        // Encabezados negrita
        const headers = Object.keys(chunkRows[0] || {});
        headers.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
          if (!worksheet[cellRef]) return;

          worksheet[cellRef].s = {
            font: { bold: true },
            alignment: { horizontal: "center" },
          };
        });

        // Colores por estado (Estado col A)
        chunkRows.forEach((row, rowIndex) => {
          const color = statusColors[String(row.Estado ?? "").toLowerCase()];
          if (!color) return;

          const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: 0 });
          const cell = worksheet[cellRef];
          if (!cell) return;

          cell.s = {
            fill: { patternType: "solid", fgColor: { rgb: color } },
            font: { bold: true },
            alignment: { horizontal: "center" },
          };
        });

        // Auto-size (acotado para que sea rápido)
        worksheet["!cols"] = headers.map((header) => ({
          wch: Math.max(
            header.length + 2,
            ...chunkRows
              .slice(0, 2000)
              .map((r) => String(r[header] ?? "").length + 2)
          ),
        }));

        // ✅ Nombre de hoja como pediste
        XLSX.utils.book_append_sheet(workbook, worksheet, `Hoja ${sheetIndex}`);

        sheetIndex++;
        chunkRows = [];
        await yieldToUI();
      };

      // 3) Construir filas y volcar por hojas
      for (const status of board) {
        if (!selectedStatuses.includes(status.id)) continue;

        for (const order of status.orders || []) {
          if (order.estimated_delivery_date) {
            const deliveryDate = new Date(order.estimated_delivery_date + "T00:00:00");

            if (startDate) {
              const start = new Date(startDate + "T00:00:00");
              if (deliveryDate < start) continue;
            }

            if (endDate) {
              const end = new Date(endDate + "T23:59:59");
              if (deliveryDate > end) continue;
            }
          }

          chunkRows.push({
            Estado: statusLabel[(status.name ?? "").toLowerCase()] ?? status.name,
            Orden: order.order_number,
            Cliente: order.client_name ?? "",
            NIT: order.nit ?? "",
            Teléfono: order.phone ?? "",
            Correo: order.email ?? "",
            "Fecha creación": order.creation_date ?? "",
            "Entrega estimada": order.estimated_delivery_date ?? "",
            "Número factura": order.numero_factura ?? "",
            "Método de pago": order.metodo_pago ?? "",
          });

          processed++;

          if (processed % 250 === 0) {
            const p = Math.min(99, Math.floor((processed / total) * 100));
            setExportProgress(p);
            setExportMsg(`Procesando ${processed} de ${total}...`);
            await yieldToUI();
          }

          if (chunkRows.length >= ROWS_PER_SHEET) {
            setExportMsg(`Creando Hoja ${sheetIndex}...`);
            await flushChunkToSheet();
          }
        }
      }

      // Volcar lo que quede
      setExportMsg("Finalizando hojas...");
      await flushChunkToSheet();

      setExportProgress(99);
      setExportMsg("Generando archivo...");

      XLSX.writeFile(workbook, "ordenes.xlsx", {
        bookType: "xlsx",
        cellStyles: true,
      });

      // ✅ Mostrar “listo” 3 segundos
      setExportProgress(100);
      setExportMsg("✅ Archivo listo");
      setExportDone(true);

      // Reset del modal export
      setExportOpen(false);
      setSelectedStatuses([]);
      setStartDate("");
      setEndDate("");

      setTimeout(() => {
        setExportDone(false);
        setExporting(false);
        setExportProgress(0);
        setExportMsg("");
        setExportToastMinimized(false);
      }, 3000);
    } catch (err) {
      console.error("Error exportando Excel:", err);
      setExportMsg("❌ Error al generar el Excel");
      setExportProgress(0);

      // deja el toast visible para que el usuario lo vea (y pueda minimizar)
      setTimeout(() => {
        setExporting(false);
        setExportDone(false);
      }, 2000);
    }
  }


  function clearBoardFilters() {
    setFilterStatuses([]);
    setFilterStartDate("");
    setFilterEndDate("");
    setOnlyPendingDelivery(false);
    setOnlyOverdue(false);
    setHideEmptyColumns(false);
    setSearch("");
    setActiveQuick(null); // ✅ también limpia el atajo
  }

  return (
    <Box p="md" h="100%" bg="linear-gradient(180deg, #f8f9fa, #e9ecef)">
      {/* ======================
          HEADER + INDICADOR
      ====================== */}
      <Group justify="space-between" mb="md" align="flex-end" wrap="wrap">
        <Group gap="sm">
          <Title order={2}>Estados de Órdenes</Title>

          {/* ✅ Indicador visible cuando hay filtros */}
          {hasActiveFilters && (
            <Badge color="orange" variant="filled">
              Filtros activos: {activeFilterCount}
            </Badge>
          )}
        </Group>

        <Group gap="sm" wrap="wrap">
          {/* 🔎 Buscador */}
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Buscar: orden, NIT, cliente..."
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
            w={280}
          />

          {/* 🧰 Filtros (naranja + contador) */}
          <Button
            color="orange"
            variant={hasActiveFilters ? "filled" : "light"}
            leftSection={<IconFilter size={16} />}
            rightSection={
              hasActiveFilters ? (
                <Badge size="xs" color="dark" variant="filled">
                  {activeFilterCount}
                </Badge>
              ) : null
            }
            onClick={() => setFilterOpen(true)}
          >
            Filtros
          </Button>

          {/* 📤 Exportar */}
          <Button color="green" onClick={() => setExportOpen(true)}>
            Exportar
          </Button>
        </Group>
      </Group>

      {/* ======================
          TABLERO DND
      ====================== */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <ScrollArea>
          <Group align="flex-start" wrap="nowrap">
            {viewBoard.map((status) => (
              <BoardColumn
                key={status.id}
                status={{
                  ...status,
                  // ✅ traducción visual (finalizado -> entregado)
                  name:
                    statusLabel[(status.name ?? "").toLowerCase()] ??
                    status.name,
                }}
              />
            ))}

            <DragOverlay>
              {activeOrder && <OrderCard order={activeOrder} isOverlay />}
            </DragOverlay>
          </Group>
        </ScrollArea>
      </DndContext>

      {/* ======================
          MODAL FILTROS TABLERO
      ====================== */}
      <Modal
        opened={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filtros del tablero"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Filtra por fecha estimada de entrega, columnas, vencidas y búsqueda.
          </Text>

          <Divider label="Atajos" />

          {/* ✅ Atajos con selección visible */}
          <Group grow>
            <Button
              color="orange"
              variant={activeQuick === "today" ? "filled" : "light"}
              onClick={() => setQuickRange("today")}
            >
              Hoy
            </Button>

            <Button
              color="orange"
              variant={activeQuick === "tomorrow" ? "filled" : "light"}
              onClick={() => setQuickRange("tomorrow")}
            >
              Mañana
            </Button>
          </Group>

          <Group grow>
            <Button
              color="orange"
              variant={activeQuick === "week" ? "filled" : "light"}
              onClick={() => setQuickRange("week")}
            >
              Esta semana
            </Button>

            <Button variant="default" onClick={clearDateRange}>
              Limpiar fechas
            </Button>
          </Group>

          <Divider label="Rango de fechas (Entrega estimada)" />

          {/* ✅ Si editan manual, se desmarca el atajo */}
          <TextInput
            type="date"
            label="Fecha inicio"
            value={filterStartDate}
            onChange={(e) => {
              setFilterStartDate(e.currentTarget.value);
              setActiveQuick(null);
            }}
          />

          <TextInput
            type="date"
            label="Fecha fin"
            value={filterEndDate}
            onChange={(e) => {
              setFilterEndDate(e.currentTarget.value);
              setActiveQuick(null);
            }}
          />

          <Divider label="Opciones" />

          <Switch
            label="Solo por entregar"
            checked={onlyPendingDelivery}
            onChange={(e) => setOnlyPendingDelivery(e.currentTarget.checked)}
            color="orange"
          />

          <Switch
            label="Solo vencidas"
            checked={onlyOverdue}
            onChange={(e) => setOnlyOverdue(e.currentTarget.checked)}
            color="orange"
          />

          <Switch
            label="Ocultar columnas vacías"
            checked={hideEmptyColumns}
            onChange={(e) => setHideEmptyColumns(e.currentTarget.checked)}
            color="orange"
          />

          <Divider label="Filtrar por columnas" />

          {board.map((status) => (
            <Checkbox
              key={status.id}
              color="orange"
              label={
                statusLabel[(status.name ?? "").toLowerCase()] ?? status.name
              }
              checked={filterStatuses.includes(status.id)}
              onChange={(e) =>
                setFilterStatuses((prev) =>
                  e.currentTarget.checked
                    ? [...prev, status.id]
                    : prev.filter((id) => id !== status.id)
                )
              }
            />
          ))}

          <Group justify="space-between" mt="sm">
            <Button variant="default" onClick={clearBoardFilters}>
              Limpiar todo
            </Button>

            <Group>
              <Button variant="default" onClick={() => setFilterOpen(false)}>
                Cerrar
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      {/* ======================
          MODAL EXPORT EXCEL
      ====================== */}
      <Modal
        opened={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exportar a Excel"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            El rango de fechas se aplica según la{" "}
            <strong>fecha estimada de entrega</strong>
          </Text>

          <TextInput
            type="date"
            label="Fecha inicio"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <TextInput
            type="date"
            label="Fecha fin"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {board.map((status) => (
            <Checkbox
              key={status.id}
              color="orange"
              label={
                statusLabel[(status.name ?? "").toLowerCase()] ?? status.name
              }
              checked={selectedStatuses.includes(status.id)}
              onChange={(e) =>
                setSelectedStatuses((prev) =>
                  e.currentTarget.checked
                    ? [...prev, status.id]
                    : prev.filter((id) => id !== status.id)
                )
              }
            />
          ))}




          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setExportOpen(false)}
              disabled={exporting}
            >
              Cancelar
            </Button>

            <Button
              color="green"
              disabled={selectedStatuses.length === 0 || exporting}
              onClick={exportToExcel}
            >
              {exporting ? "Generando..." : "Exportar"}
            </Button>

          </Group>
        </Stack>
      </Modal>

      {/* ======================
    ✅ NOTIFICACIÓN FLOTANTE EXPORT
====================== */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={exporting || exportDone || exportProgress > 0}>
          {(styles) => (
            <div style={styles}>
              {exportToastMinimized ? (
                <Paper
                  withBorder
                  shadow="md"
                  radius="md"
                  p="sm"
                  style={{ cursor: "pointer", maxWidth: 260 }}
                  onClick={() => setExportToastMinimized(false)}
                >
                  <Group justify="space-between" gap="sm" wrap="nowrap">
                    <Text size="sm" fw={600}>
                      {exportDone ? "✅ Archivo listo" : `Exportando... ${exportProgress}%`}
                    </Text>
                    <ActionIcon variant="subtle" onClick={() => setExportToastMinimized(false)}>
                      <IconChevronUp size={18} />
                    </ActionIcon>
                  </Group>
                  <Progress value={exportProgress} size="sm" mt={8} />
                </Paper>
              ) : (
                <Notification
                  withBorder
                  radius="md"
                  title="Exportación en progreso"
                  onClose={() => setExportToastMinimized(true)} // ✅ “cerrar” = minimizar
                  styles={{
                    root: {
                      width: 340,
                      maxWidth: "90vw",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)", // ✅ sombra sin prop shadow
                    },
                  }}
                >

                  <Stack gap={8}>
                    <Text size="sm" c="dimmed">
                      {exportMsg || "Generando archivo Excel..."}
                    </Text>

                    <Progress value={exportProgress} size="md" />

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {exportProgress}%
                      </Text>

                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => setExportToastMinimized(true)}
                        >
                          Minimizar
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
                </Notification>
              )}
            </div>
          )}
        </Transition>
      </Affix>

    </Box>
  );
}

