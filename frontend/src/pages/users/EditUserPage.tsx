import { useEffect, useState } from "react";
import {
    Paper,
    Title,
    TextInput,
    PasswordInput,
    Select,
    Button,
    Stack,
    SimpleGrid,
    Loader,
    Center,
    Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const currentUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState<string>("3");

    // 🔐 ¿Es el Admin editándose a sí mismo?
    const isAdminSelf =
        currentUser?.role_id === 1 && currentUser?.id === Number(id);

    // 🔹 Cargar usuario
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch("/api/users", {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("No se pudo cargar el usuario");

                const users = await res.json();
                const user = users.find((u: any) => u.id === Number(id));

                if (!user) throw new Error("Usuario no encontrado");

                setName(user.name);
                setEmail(user.email);
                setRoleId(String(user.role_id));
            } catch (e: any) {
                notifications.show({
                    title: "Error",
                    message: e.message,
                    color: "red",
                });
                navigate("/dashboard/usuarios");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [id]);

    // 🔹 Guardar cambios
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    email,
                    ...(isAdminSelf ? {} : { role_id: Number(roleId) }),
                    ...(password ? { password } : {}),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "No se pudo actualizar");
            }

            notifications.show({
                title: "Listo",
                message: "Usuario actualizado correctamente",
                color: "green",
            });

            navigate("/dashboard/usuarios", { replace: true });
        } catch (e: any) {
            notifications.show({
                title: "Error",
                message: e.message,
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
        <Paper p="lg" radius="md" withBorder>
            <Title order={3} mb="md">
                Editar usuario
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
                            label="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            description="Déjalo vacío para no cambiarla"
                        />

                        <Select
                            label="Rol"
                            value={roleId}
                            disabled={isAdminSelf}
                            data={[
                                ...(isAdminSelf
                                ? [{ value: "1", label: "Admin" }]
                                : []),
                                { value: "2", label: "Gerente" },
                                { value: "3", label: "Ventas" },
                                { value: "4", label: "Producción" },
                            ]}
                            required={!isAdminSelf}
                            />

                    </SimpleGrid>

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={() => navigate("/dashboard/usuarios")}
                        >
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