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

    // Parsear fecha sin conversión de timezone
    const [year, month, day] = order.estimated_delivery_date.split("-").map(Number);
    const deliveryDate = new Date(year, month - 1, day);
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
        touchAction: "manipulation", // permite scroll, el delay del sensor controla el drag
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
            {(() => {
              const [y, m, d] = order.estimated_delivery_date.split("-").map(Number);
              return new Date(y, m - 1, d).toLocaleDateString("es-CO");
            })()}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
