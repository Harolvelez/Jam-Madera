import { useEffect, useState } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Divider,
  Select,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  // Usar fecha local (Colombia) sin conversión UTC
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const token = localStorage.getItem("token");

  /* ======================
     ESTADOS
  ====================== */
  const [orderNumber, setOrderNumber] = useState("");
  const [nit, setNit] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ingresoType, setIngresoType] =
    useState<"Factura" | "Pedido">("Pedido");
  const [creationDate, setCreationDate] = useState(today);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [metodoPago, setMetodoPago] = useState<"Banco" | "Efectivo" | "">("");
  const [saving, setSaving] = useState(false);

  // 🆕 UN SOLO CAMPO PARA ITEMS
  const [itemsText, setItemsText] = useState("");

  /* ======================
     NÚMERO DE ORDEN
  ====================== */
  useEffect(() => {
    fetch("/api/orders-next-number", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrderNumber(data.next))
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "No se pudo generar el número de orden",
          color: "red",
        });
      });
  }, [token]);

  /* ======================
     GUARDAR
  ====================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 CONVERTIR TEXTO EN ITEMS
    const items = itemsText
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/^\s*[•\-\*\u2022]\s*/g, "") // ✅ quita • - * al inicio
      )
      .filter(Boolean)
      .map((description) => ({
        description,
        quantity: 1,
        width: 0,
        length: 0,
        calibre: 0,
      }));

    if (items.length === 0) {
      notifications.show({
        title: "Atención",
        message: "Debes ingresar al menos un ítem",
        color: "yellow",
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_number: orderNumber,
          nit,
          client_name: clientName,
          phone,
          email: email || null,
          ingreso_type: ingresoType,
          creation_date: creationDate,
          estimated_delivery_date: estimatedDeliveryDate || null,
          numero_factura: numeroFactura || null,
          metodo_pago: metodoPago || null,
          items,
        }),
      });

      if (!res.ok) throw new Error();

      notifications.show({
        title: "Orden creada",
        message: "La orden se guardó correctamente",
        color: "green",
      });

      navigate("/dashboard/orders/OrderList", { replace: true });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo guardar la orden",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <Paper p="lg" radius="md">
      <Title order={3} mb="md">
        Crear Orden
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            label="Número de orden"
            value={orderNumber}
            readOnly
            styles={{ input: { backgroundColor: "#f1f3f5" } }}
          />

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput
              label="Nombre del cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />

            <TextInput
              label="NIT"
              value={nit}
              onChange={(e) =>
                setNit(e.target.value.replace(/[^a-zA-Z0-9\-]/g, ""))
              }
              required
            />

            <TextInput
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
            />

            <TextInput
              label="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </SimpleGrid>

          <Select
            label="Tipo de ingreso"
            data={[
              { value: "Factura", label: "Factura" },
              { value: "Pedido", label: "Pedido" },
            ]}
            value={ingresoType}
            onChange={(v) => setIngresoType(v as any)}
            required
          />

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput
              type="date"
              label="Fecha de creación"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
            />

            <TextInput
              type="date"
              label="Fecha estimada de entrega"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput
              label="Número de factura"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              placeholder="Ej: FAC-001"
            />

            <Select
              label="Método de pago"
              placeholder="Seleccione método de pago"
              data={[
                { value: "Banco", label: "Banco" },
                { value: "Efectivo", label: "Efectivo" },
              ]}
              value={metodoPago}
              onChange={(v) => setMetodoPago(v as any)}
              clearable
            />
          </SimpleGrid>

          <Divider label="Descripción de la orden" />

          <Textarea
            label="Ítems"
            placeholder={`Ejemplo:
              • 10 tablas de pino 2x4
              • Corte especial para puerta
              • Madera tratada para exterior`}
            autosize
            minRows={8}
            maxRows={14}
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            required
          />

          <Button type="submit" size="md" loading={saving}>
            Guardar orden
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
