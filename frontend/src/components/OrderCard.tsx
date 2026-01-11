import { Card, Text, Stack, Badge, Group } from "@mantine/core";
import { useDraggable } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";

export default function OrderCard({
  order,
  statusId,
  statusName,
  isOverlay = false,
}: any) {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { statusId },
  });

  // ✅ Detectar si esta tarjeta está en ENTREGADO
  const isDelivered = (statusName ?? "").toLowerCase() === "entregado";

  /* =========================
     🔴 CÁLCULO DE VENCIMIENTO
  ========================= */
  let isOverdue = false;

  if (order.estimated_delivery_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deliveryDate = new Date(order.estimated_delivery_date + "T00:00:00");
    isOverdue = deliveryDate < today;
  }

  // ✅ Si está entregado, NO mostrar vencida
  const showOverdue = !isDelivered && isOverdue;

  // ✅ Colores de la tarjeta (borde izquierdo)
  const leftBorder = isDelivered
    ? "4px solid #2f9e44" // verde
    : showOverdue
    ? "4px solid #fa5252" // rojo
    : "4px solid transparent";

  return (
    <Card
      ref={!isOverlay ? setNodeRef : undefined}
      style={{
        cursor: "grab",
        opacity: isDragging ? 0 : 1,
        borderLeft: leftBorder,
        touchAction: "none",
        background: isDelivered ? "#ebfbee" : undefined, // suave verde solo en entregado
      }}
      {...(!isOverlay ? { ...listeners, ...attributes } : {})}
      shadow={isOverlay ? "lg" : "xs"}
      radius="md"
      p="sm"
      withBorder
    >
      <Stack gap={6}>
        {/* ORDEN + BADGE */}
        <Group justify="space-between">
          <Text
            fw={600}
            size="sm"
            style={{ cursor: "pointer", touchAction: "manipulation" }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => navigate(`/dashboard/orders/Detail/${order.id}`)}
          >
            {order.order_number}
          </Text>

          {/* ✅ En ENTREGADO: LISTO; en otros: VENCIDA */}
          {isDelivered ? (
            <Badge color="green" size="xs" variant="light">
              LISTO
            </Badge>
          ) : (
            showOverdue && (
              <Badge color="red" size="xs" variant="light">
                Vencida
              </Badge>
            )
          )}
        </Group>

        {/* CLIENTE */}
        {order.client_name && (
          <Text size="xs" c="dimmed">
            👤 {order.client_name}
          </Text>
        )}

        {/* FECHA ENTREGA */}
        {order.estimated_delivery_date && (
          <Text size="xs" c={isDelivered ? "green" : showOverdue ? "red" : "gray.6"}>
            📦 Entrega:{" "}
            {new Date(order.estimated_delivery_date).toLocaleDateString("es-CO")}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
