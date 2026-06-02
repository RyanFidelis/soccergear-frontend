import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  const handleLogin = async (e) => {
    e.preventDefault();

=======
  const API_URL = process.env.REACT_APP_API_URL || "https://soccergear-backend.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Tentando conectar na API:", API_URL);

>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    if (!email || !password) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
<<<<<<< HEAD
      const response = await fetch('http://localhost:3001/api/auth/login', {
=======
      const response = await fetch(`${API_URL}/api/auth/login`, {
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
<<<<<<< HEAD
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));

        window.dispatchEvent(new Event("user-updated"));

        navigate("/"); 
      } else {
        alert(data.message || "Erro ao fazer login.");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao conectar com o servidor.");
=======
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
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
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
<<<<<<< HEAD
=======
              placeholder="seu@email.com"
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
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
<<<<<<< HEAD
=======
              placeholder="********"
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
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