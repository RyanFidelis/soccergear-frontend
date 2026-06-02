import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/HeaderFooter.css";

export default function Cadastro() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const API_URL =
    process.env.REACT_APP_API_URL;

  const cadastrar = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Erro ao cadastrar"
        );
        return;
      }

      const usuario =
        data.user ||
        data.usuario ||
        data;

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
      );

      window.dispatchEvent(
        new Event("user-updated")
      );

      alert("Cadastro realizado!");

      navigate("/");
    } catch (error) {
      console.error(error);

      alert("Erro no cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-cadastro">
      <form
        className="form-cadastro"
        onSubmit={cadastrar}
      >
        <h1>Criar Conta</h1>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Cadastrando..."
            : "Cadastrar"}
        </button>
      </form>
    </main>
  );
}
