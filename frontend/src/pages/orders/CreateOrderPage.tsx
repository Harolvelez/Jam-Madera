import { useEffect, useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Paper,
  Title,
  Card,
  Divider,
  Select,
  Stack,
  SimpleGrid,
  Group,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";

type OrderItem = {
  description: string;
  quantity: number;
  width: number;
  height: number;
  length: number;
};

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  /* ======================
     ESTADOS
  ====================== */
  const [orderNumber, setOrderNumber] = useState("");
  const [nit, setNit] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ingresoType, setIngresoType] = useState<"interno" | "externo">(
    "interno"
  );
  const [creationDate, setCreationDate] = useState(today);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<OrderItem[]>([
    { description: "", quantity: 1, width: 0, height: 0, length: 0 },
  ]);

  /* ======================
     NÚMERO DE ORDEN
  ====================== */
  useEffect(() => {
    fetch("/api/orders-next-number")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setOrderNumber(data.next))
      .catch(() => {
        notifications.show({
          title: "Error",
          message: "No se pudo generar el número de orden",
          color: "red",
        });
      });
  }, []);

  /* ======================
     ITEMS
  ====================== */
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, width: 0, height: 0, length: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = <K extends keyof OrderItem>(
    index: number,
    field: K,
    value: OrderItem[K]
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  /* ======================
     GUARDAR
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
      items,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      notifications.show({
        title: "Orden creada",
        message: "La orden se guardó correctamente",
        color: "green",
        autoClose: 2000,
      });

      navigate("/dashboard/orders/OrderList", { replace: true });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo guardar la orden",
        color: "red",
        autoClose: 4000,
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
          {/* NÚMERO */}
          <TextInput
            label="Número de orden"
            value={orderNumber}
            readOnly
            styles={{ input: { backgroundColor: "#f1f3f5" } }}
          />

          {/* DATOS DEL CLIENTE */}
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
              required
              placeholder="900123456-7"
              onChange={(e) =>
                setNit(e.target.value.replace(/[^a-zA-Z0-9\-]/g, ""))
              }
            />

            <TextInput
              label="Teléfono"
              value={phone}
              required
              inputMode="numeric"
              placeholder="3001234567"
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
            />

            <TextInput
              label="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </SimpleGrid>

          {/* INGRESO */}
          <Select
            label="Tipo de ingreso"
            data={[
              { value: "interno", label: "Ingreso interno" },
              { value: "externo", label: "Ingreso externo" },
            ]}
            value={ingresoType}
            onChange={(v) => setIngresoType(v as "interno" | "externo")}
            required
          />

          {/* FECHAS */}
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

          <Divider label="Items de la orden" />

          {/* ITEMS */}
          {items.map((item, index) => (
            <Card key={index} withBorder>
              <Stack>
                <TextInput
                  label="Descripción"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  required
                />

                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xs">
                  <NumberInput
                    label="Cantidad"
                    value={item.quantity}
                    min={1}
                    onChange={(v) =>
                      updateItem(index, "quantity", Number(v) || 1)
                    }
                  />
                  <NumberInput
                    label="Ancho"
                    value={item.width}
                    onChange={(v) =>
                      updateItem(index, "width", Number(v) || 0)
                    }
                  />
                  <NumberInput
                    label="Alto"
                    value={item.height}
                    onChange={(v) =>
                      updateItem(index, "height", Number(v) || 0)
                    }
                  />
                  <NumberInput
                    label="Largo"
                    value={item.length}
                    onChange={(v) =>
                      updateItem(index, "length", Number(v) || 0)
                    }
                  />
                </SimpleGrid>

                {items.length > 1 && (
                  <Group justify="flex-end">
                    <Button
                      color="red"
                      size="xs"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => removeItem(index)}
                    >
                      Quitar item
                    </Button>
                  </Group>
                )}
              </Stack>
            </Card>
          ))}

          <Button
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={addItem}
          >
            Agregar item
          </Button>

          <Button type="submit" size="md" loading={saving}>
            Guardar orden
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
