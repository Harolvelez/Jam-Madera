import { Box, Text, Badge, Stack, Paper, Group, ScrollArea } from "@mantine/core";
import { useDroppable } from "@dnd-kit/core";
import OrderCard from "./OrderCard";

export default function BoardColumn({ status }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { statusId: status.id },
  });

  return (
    <Box ref={setNodeRef} style={{ minHeight: "70vh" }}>
      <Paper
        radius="lg"
        p="sm"
        w={300}
        bg={isOver ? "blue.0" : "gray.1"}
        shadow="sm"
        withBorder
        style={{
          height: "calc(100vh - 160px)", // 👈 ajusta si lo quieres más alto/bajo
          display: "flex",
          flexDirection: "column",
        }}
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

        {/* Cards con scroll propio */}
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="sm" pr="xs">
            {status.orders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                statusId={status.id}
                statusName={status.name} // 👈 IMPORTANTE (para detectar ENTREGADO)
              />
            ))}
          </Stack>
        </ScrollArea>
      </Paper>
    </Box>
  );
}
