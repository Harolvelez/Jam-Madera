import { useEffect, useMemo, useState } from "react";
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

  // ✅ textarea con todos los items
  const [itemsText, setItemsText] = useState("");

  // ✅ items originales (para bloquear cambios si no tiene permiso)
  const [originalItems, setOriginalItems] = useState<any[]>([]);

  // ✅ rol numérico (admin=1, gerente=2)
  const roleId = useMemo(() => {
    const safeParseIntStrict = (v: any) => {
      const s = String(v ?? "").trim();
      if (!/^\d+$/.test(s)) return 0;
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    };

    // 1) desde user en localStorage
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        const possible =
          u?.role_id ??
          u?.roleId ??
          u?.rol_id ??
          u?.id_rol ??
          u?.role ??
          u?.rol;
        const n = safeParseIntStrict(possible);
        if (n) return n;
      } catch {
        // ignore
      }
    }

    // 2) desde llaves sueltas
    const possibleKeys = ["role_id", "roleId", "rol_id", "id_rol", "role", "rol"];
    for (const k of possibleKeys) {
      const n = safeParseIntStrict(localStorage.getItem(k));
      if (n) return n;
    }

    return 0;
  }, []);

  const canEditItems = roleId === 1 || roleId === 2;

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

        // ✅ guardar items originales
        const items = data.items ?? [];
        setOriginalItems(items);

        // ✅ llenar textarea (si algún description trae saltos, también los separa)
        setItemsText(
          items
            .flatMap((it: any) => String(it.description ?? "").split(/\r?\n/))
            .map((l: string) => l.trimEnd())
            .join("\n")
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

    // 1) descriptions limpias desde textarea (1 línea = 1 item)
    const descriptions = itemsText
      .split(/\r?\n/)
      .map((line) =>
        line
          .trim()
          .replace(/^\s*[•\-\*\u2022]\s*/g, "") // quita • - * al inicio
      )
      .filter(Boolean)
      .map((d) => d.slice(0, 255)); // por si tu backend limita

    // 2) construir items alineados con originales (incluye id si existía)
    const itemsFromText = descriptions.map((description, idx) => {
      const prev = originalItems[idx]; // puede no existir si se agregan más líneas
      return {
        ...(prev?.id ? { id: prev.id } : {}), // ✅ clave: mandar id si existe
        description,
        quantity: prev?.quantity ?? 1,
        width: prev?.width ?? 0,
        height: prev?.height ?? 0,
        length: prev?.length ?? 0,
        calibre: prev?.calibre ?? 0,
      };
    });

    // ✅ si no tiene permiso, enviamos items originales
    const itemsToSend = canEditItems ? itemsFromText : originalItems;

    if (canEditItems && itemsToSend.length === 0) {
      notifications.show({
        title: "Atención",
        message: "Debes ingresar al menos un ítem",
        color: "yellow",
      });
      setSaving(false);
      return;
    }

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
      items: itemsToSend,
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
              readOnly={!canEditItems}
              styles={{
                input: !canEditItems
                  ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" }
                  : undefined,
              }}
              description={
                !canEditItems
                  ? "Solo Gerente puede editar esta descripción."
                  : undefined
              }
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
