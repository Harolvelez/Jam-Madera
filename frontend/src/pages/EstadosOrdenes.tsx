import { useEffect, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";

import { Box, Title, ScrollArea, Group } from "@mantine/core";
import BoardColumn from "../components/BoardColumn";
import { getOrderBoard, moveOrder } from "../services/api";

export default function EstadosOrdenes() {
  const [board, setBoard] = useState<any[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    loadBoard();
  }, []);

  async function loadBoard() {
    const data = await getOrderBoard();
    setBoard(data);
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const orderId = Number(active.id);
    const newStatusId = Number(over.id);

    await moveOrder(orderId, newStatusId);
    loadBoard();
  }

  return (
    <Box p="md" bg="gray.1" h="100%">
      <Title order={2} mb="md">
        Estados de Órdenes
      </Title>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <ScrollArea offsetScrollbars>
          <Group align="flex-start" gap="md" wrap="nowrap">
            {board.map((status) => (
              <BoardColumn key={status.id} status={status} />
            ))}
          </Group>
        </ScrollArea>
      </DndContext>
    </Box>
  );
}