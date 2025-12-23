import { useState } from "react";
import {
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Select,
  Button,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

export default function CreateUserPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>("3"); // default Ventas
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role_id: Number(roleId),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo crear el usuario");
      }

      notifications.show({
        title: "Listo",
        message: "Usuario creado correctamente",
        color: "green",
      });

      // ✅ redirigir a lista
      navigate("/dashboard/usuarios", { replace: true });
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e.message || "Error creando usuario",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Crear usuario
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextInput
              label="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              description="Para pruebas puedes usar admin123"
            />

            <Select
              label="Rol"
              value={roleId}
              onChange={(v) => setRoleId(v || "3")}
              data={[
                { value: "2", label: "Gerente" },
                { value: "3", label: "Ventas" },
                { value: "4", label: "Producción" },
              ]}
              required
            />
          </SimpleGrid>

          <Button type="submit" loading={saving}>
            Guardar usuario
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
