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
  Loader,
  Center,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";

type OrderItem = {
  id?: number;
  description: string;
  quantity: number;
  width: number;
  calibre: number;
  length: number;
};

export default function OrderEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // ✅ AÑADIDO

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [nit, setNit] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ingresoType, setIngresoType] =
    useState<"interno" | "externo">("interno");
  const [creationDate, setCreationDate] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const [items, setItems] = useState<OrderItem[]>([]);

  /* ======================
     CARGAR ORDEN
  ====================== */
  useEffect(() => {
    fetch(`/api/orders/${id}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // ✅ AÑADIDO
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
        setItems(data.items);

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
     ITEMS
  ====================== */
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, width: 0, calibre: 0, length: 0 },
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
      items,
    };

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`, // ✅ AÑADIDO
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      notifications.show({
        title: "Orden actualizada",
        message: "La orden se actualizó correctamente",
        color: "green",
      });

      navigate("/dashboard/orders/OrderList");
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
              { value: "interno", label: "Ingreso interno" },
              { value: "externo", label: "Ingreso externo" },
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

          <Divider label="Items de la orden" />

          {items.map((item, index) => (
            <Card key={index} withBorder>
              <Stack>
                <TextInput
                  label="Descripción"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />

                <SimpleGrid cols={{ base: 2, md: 4 }}>
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
                    label="Largo"
                    value={item.length}
                    onChange={(v) =>
                      updateItem(index, "length", Number(v) || 0)
                    }
                  />
                  <NumberInput
                    label="Calibre"
                    value={item.calibre}
                    onChange={(v) =>
                      updateItem(index, "calibre", Number(v) || 0)
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