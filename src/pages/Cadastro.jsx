import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Cadastro() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://soccergear-backend.onrender.com";

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setTelefone(value);
  };

  const isPasswordValid = password.length >= 6 && password.length <= 20;

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!username || !email || !telefone || !dataNascimento || !password || !confirmPassword) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    // Validação de Nome (Mínimo 2 nomes)
    const nameParts = username.trim().split(/\s+/);
    if (nameParts.length < 2) {
      alert("Por favor, insira seu nome completo (nome e sobrenome).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      alert("Reveja os dados fornecidos pois o cadastro não pode ser realizado.");
      return;
    }

    if (!isPasswordValid) {
      alert("A senha deve ter entre 6 e 20 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (!termos) {
      alert("Você deve aceitar os termos de uso.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: username, 
          email: email, 
          telefone: telefone,
          dataNascimento: dataNascimento,
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        alert(`Bem-vindo, ${data.user.name}! Cadastro realizado com sucesso.`);
        navigate("/perfil");
      } else {
        alert(`Erro: ${data.message || "Erro ao cadastrar"}`);
      }

    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-cadastro">
      <div className="card-cadastro">
        <h1 className="titulo-cadastro">Criar Conta</h1>
        <form onSubmit={handleCadastro} autoComplete="off">
          
          <div className="input-container-cadastro">
            <label>Nome Completo</label>
            <input
              className="input-cadastro"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-container-cadastro">
            <label>Email</label>
            <input
              className="input-cadastro"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-container-cadastro">
            <label>Telefone</label>
            <input
              className="input-cadastro"
              type="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={handlePhoneChange}
              maxLength="15"
              required
            />
          </div>

          <div className="input-container-cadastro">
            <label>Data de Nascimento</label>
            <input
              className="input-cadastro"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
            />
          </div>

          <div className="input-container-cadastro">
            <label>Senha</label>
            <input
              className="input-cadastro"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && (
              <span style={{ 
                color: isPasswordValid ? "green" : "red", 
                fontSize: "0.85rem", 
                display: "block", 
                marginTop: "5px" 
              }}>
                {isPasswordValid 
                  ? "✔ Confere: deve conter de 6 a 20 caracteres" 
                  : "✖ Deve conter de 6 a 20 caracteres"}
              </span>
            )}
          </div>

          <div className="input-container-cadastro">
            <label>Confirmar Senha</label>
            <input
              className="input-cadastro"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-container-cadastro termos-cadastro">
            <input
              type="checkbox"
              checked={termos}
              onChange={() => setTermos(!termos)}
            />
            <label>Concordo com os termos de uso</label>
          </div>

          <button type="submit" className="btn-cadastro" disabled={loading}>
            {loading ? "Criando conta..." : "Cadastrar e Entrar"}
          </button>
        </form>

        <p className="texto-cadastro">
          Já tem uma conta?{" "}
          <span className="link-cadastro" onClick={() => navigate("/login")}>
            Entrar
          </span>
        </p>
      </div>
    </div>
  );
}