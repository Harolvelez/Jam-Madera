import { Card, Text, Stack } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";

export default function OrderCard({ order, statusId, isOverlay = false }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { statusId },
  });



  return (
      <Card
        ref={!isOverlay ? setNodeRef : undefined}
        style={{
          cursor: "grab",
          opacity: isDragging ? 0 : 1,
        }}
        {...(!isOverlay ? listeners : {})}
        {...(!isOverlay ? attributes : {})}
        shadow={isOverlay ? "lg" : "xs"}
        radius="md"
        p="sm"
        withBorder
      >


      <Stack gap={4}>
        <Text fw={600} size="sm">
          {order.order_number}
        </Text>

        <Text size="xs" c="dimmed">
          {order.client?.name}
        </Text>

        {order.delivery_date && (
          <Text size="xs" c="gray.6">
            📦 Entrega: {order.delivery_date}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
