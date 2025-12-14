import { Box, Text, Badge, Stack, Paper, Group } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import OrderCard from "./OrderCard";

export default function BoardColumn({ status }: any) {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  return (
    <Paper
      ref={setNodeRef}
      radius="md"
      p="sm"
      w={280}
      bg="gray.2"
      shadow="xs"
    >
      {/* Header */}
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="sm" tt="uppercase">
          {status.name}
        </Text>
        <Badge size="sm" variant="light">
          {status.orders.length}
        </Badge>
      </Group>

      {/* Cards */}
      <Stack gap="sm">
        {status.orders.map((order: any) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </Stack>
    </Paper>
  );
}
