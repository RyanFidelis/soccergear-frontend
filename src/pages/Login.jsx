import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://soccergear-backend.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Tentando conectar na API:", API_URL);

    if (!email || !password) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login realizado com sucesso!");
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        
        window.dispatchEvent(new Event("user-updated"));
        
        navigate("/"); 
      } else {
        alert("os dados fornecidos não foram encontrado");
      }

    } catch (error) {
      console.error("Erro crítico no login:", error);
      alert("Erro ao conectar com o servidor. Verifique se o backend está ligado no Render.");
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
              placeholder="seu@email.com"
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
              placeholder="********"
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