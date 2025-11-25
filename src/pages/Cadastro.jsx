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

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (!username || !email || !telefone || !dataNascimento || !password || !confirmPassword) {
      alert("Por favor, preencha todos os campos!");
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
      const response = await fetch('http://localhost:3001/api/auth/register', {
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
        // === MUDANÇA PROFISSIONAL ===
        // Em vez de mandar para o login, já logamos o usuário direto!
        localStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        
        alert(`Bem-vindo, ${data.user.name}! Cadastro realizado com sucesso.`);
        
        // Redireciona direto para o Perfil (ou Home)
        navigate("/perfil");
      } else {
        alert(`❌ Erro: ${data.message || "Erro ao cadastrar"}`);
      }

    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("❌ Erro ao conectar com o servidor.");
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
              onChange={(e) => setTelefone(e.target.value)}
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