import { useState } from "react";
import { TextInput, PasswordInput, Paper, Title, Button, Alert } from "@mantine/core";
import logo from "../assets/logo_jam_maderas.jpg";
import "./Login.css"; // <-- Importa el CSS

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Credenciales incorrectas");
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);

            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <Paper shadow="md" radius="md" p="xl" withBorder className="login-card">

                {/* Imagen circular */}
                <div className="logo-wrapper">
                    <img src={logo} alt="Logo" className="login-logo" />
                </div>

                <Title order={2} ta="center" mb="lg">
                    Iniciar sesión
                </Title>

                {error && <Alert color="red" mb="md">{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextInput
                        label="Correo electrónico"
                        placeholder="admin@jam.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        mb="md"
                    />

                    <PasswordInput
                        label="Contraseña"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        mb="xl"
                    />

                    <Button type="submit" fullWidth size="md">
                        Entrar
                    </Button>
                </form>
            </Paper>
        </div>
    );
}