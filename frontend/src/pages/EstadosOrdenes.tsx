import { useEffect, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import OrderCard from "../components/OrderCard.tsx";
import { Box, Title, ScrollArea, Group } from "@mantine/core";
import BoardColumn from "../components/BoardColumn";
import { getOrderBoard, moveOrder } from "../services/api";

export default function EstadosOrdenes() {
  const [board, setBoard] = useState<any[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeOrder, setActiveOrder] = useState<any | null>(null);


  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    const data = await getOrderBoard();
    setBoard(data);
  }

  function moveOrderLocally(orderId: number, fromStatusId: number, toStatusId: number) {
    setBoard((prev) => {
      const newBoard = structuredClone(prev);

      const fromColumn = newBoard.find((s: any) => s.id === fromStatusId);
      const toColumn = newBoard.find((s: any) => s.id === toStatusId);

      if (!fromColumn || !toColumn) return prev;

      const orderIndex = fromColumn.orders.findIndex((o: any) => o.id === orderId);
      if (orderIndex === -1) return prev;

      const [order] = fromColumn.orders.splice(orderIndex, 1);
      toColumn.orders.push(order);

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

    let newStatusId = Number(over.id);
    if (over.data.current?.statusId) {
      newStatusId = Number(over.data.current.statusId);
    }

    const oldStatusId = active.data.current?.statusId;
    if (!oldStatusId || oldStatusId === newStatusId) return;

    // 🔥 1. MOVER LOCALMENTE (INMEDIATO)
    moveOrderLocally(orderId, oldStatusId, newStatusId);

    // 🔁 2. SINCRONIZAR BACKEND (ASYNC)
    try {
      await moveOrder(orderId, newStatusId);
    } catch (e) {
      // Opcional: rollback si falla
      loadBoard();
    }
  }



  return (
      <Box
        p="md"
        h="100%"
        bg="linear-gradient(180deg, #f8f9fa, #e9ecef)"
      >
      <Title order={2} mb="md">
        Estados de Órdenes
      </Title>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
        <ScrollArea offsetScrollbars>
          <Group align="flex-start" gap="lg" wrap="nowrap">
            {board.map((status) => (
              <BoardColumn key={status.id} status={status} />


            ))}
          <DragOverlay>
            {activeOrder ? (
              <OrderCard order={activeOrder} isOverlay />
            ) : null}
          </DragOverlay>

          </Group>
        </ScrollArea>
      </DndContext>
    </Box>
  );
}