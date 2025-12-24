import { Box, Text, Badge, Stack, Paper, Group } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import OrderCard from "./OrderCard";

export default function BoardColumn({ status }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  return (
    <Box
      ref={setNodeRef}
      style={{ minHeight: "70vh" }}
    >
      <Paper
        radius="lg"
        p="sm"
        w={300}
        bg={isOver ? "blue.0" : "gray.1"}
        shadow="sm"
        withBorder
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
        <Stack gap="sm" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {status.orders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              statusId={status.id}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
