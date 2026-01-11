import { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Card,
  Divider,
  Select,
  Stack,
  SimpleGrid,
  Group,
  Loader,
  Center,
  Textarea,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";



export default function OrderEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [nit, setNit] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ingresoType, setIngresoType] =
    useState<"Factura" | "Pedido">("Pedido");
  const [creationDate, setCreationDate] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [metodoPago, setMetodoPago] = useState<"Banco" | "Efectivo" | "">("");

  // 👉 ahora SOLO un texto
  const [itemsText, setItemsText] = useState("");

  /* ======================
     CARGAR ORDEN
  ====================== */
  useEffect(() => {
    fetch(`/api/orders/${id}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setOrderNumber(data.order_number);
        setNit(data.nit);
        setClientName(data.client_name);
        setPhone(data.phone);
        setEmail(data.email ?? "");
        setIngresoType(data.ingreso_type);
        setCreationDate(data.creation_date?.slice(0, 10));
        setEstimatedDeliveryDate(
          data.estimated_delivery_date?.slice(0, 10) ?? ""
        );
        setNumeroFactura(data.numero_factura ?? "");
        setMetodoPago(data.metodo_pago ?? "");

        // ✅ Unimos todos los items con salto de línea
        setItemsText(
          (data.items ?? []).map((it: any) => it.description).join("\n")
        );


        setLoading(false);
      })
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "No se pudo cargar la orden",
          color: "red",
        });
        navigate("/dashboard/orders/OrderList");
      });
  }, [id, navigate, token]);

  /* ======================
     GUARDAR CAMBIOS
  ====================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = {
      order_number: orderNumber,
      nit,
      client_name: clientName,
      phone,
      email: email || null,
      ingreso_type: ingresoType,
      creation_date: creationDate || null,
      estimated_delivery_date: estimatedDeliveryDate || null,
      numero_factura: numeroFactura || null,
      metodo_pago: metodoPago || null,

      // 👇 enviamos UN SOLO item
      items: [
        {
          description: itemsText,
        },
      ],
    };

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      notifications.show({
        title: "Orden actualizada",
        message: "La orden se actualizó correctamente",
        color: "green",
      });

      navigate(`/dashboard/orders/Detail/${id}`, { replace: true });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo actualizar la orden",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  /* ======================
     RENDER
  ====================== */
  return (
    <Paper p="lg" radius="md">
      <Title order={3} mb="md">
        Editar Orden
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
              onChange={(e) => setNit(e.target.value)}
              required
            />

            <TextInput
              label="Teléfono"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
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
              onChange={(e) =>
                setEstimatedDeliveryDate(e.target.value)
              }
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

          <Divider label="Items de la orden" />

          <Card withBorder>
            <Textarea
              label="Descripción de los items"
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              autosize
              minRows={6}
              placeholder={`Ejemplo:
- Puerta en madera cedro
- Marco reforzado
- Acabado natural`}
            />
          </Card>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
