import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Salva os dados no navegador
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));

        // 2. AVISA O HEADER QUE ENTROU (Linha essencial)
        window.dispatchEvent(new Event("user-updated"));

        // 3. Redireciona
        navigate("/"); // Mudei para "/" (Home), mas pode ser "/perfil" se preferir
      } else {
        alert(data.message || "Erro ao fazer login.");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      alert("❌ Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-login">
      <div className="card-login">
        <h1 className="titulo-login">Entrar na Conta</h1>
        <form onSubmit={handleLogin} autoComplete="off">
          
          <div className="input-container-login">
            <label>Email</label>
            <input
              className="input-login"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-container-login">
            <label>Senha</label>
            <input
              className="input-login"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="texto-login">
          Ainda não tem conta?{" "}
          <span className="link-login" onClick={() => navigate("/cadastro")}>
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}