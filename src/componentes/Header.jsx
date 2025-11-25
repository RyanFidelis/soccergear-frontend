import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/HeaderFooter.css";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const getInicial = (nome) => {
    if (!nome) return "U";
    return nome.trim().charAt(0).toUpperCase();
  };

  const fetchUsuarioDoBanco = async () => {
    const saved = localStorage.getItem("usuarioLogado");
    if (!saved) { setUsuario(null); return; }

    try {
      const userLocal = JSON.parse(saved);
      if (!userLocal?.id) return;

      // Busca do banco para garantir dados novos
      const res = await fetch(`http://localhost:3001/api/auth/user/${userLocal.id}?_t=${Date.now()}`);

      if (res.ok) {
        const userBanco = await res.json();
        // Log para confirmar o que está chegando
        console.log("📡 FOTO VINDA DO BANCO:", userBanco.foto ? userBanco.foto.substring(0, 30) + "..." : "Sem foto");

        setUsuario(userBanco);
        localStorage.setItem("usuarioLogado", JSON.stringify(userBanco));
      } else {
        setUsuario(userLocal);
      }
    } catch (error) {
      console.error("Erro Header:", error);
      setUsuario(JSON.parse(saved));
    }
  };

  const atualizarCarrinho = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.reduce((total, item) => total + (item.quantity || 0), 0));
  };

  useEffect(() => {
    fetchUsuarioDoBanco();
    atualizarCarrinho();

    const handleAll = () => { fetchUsuarioDoBanco(); atualizarCarrinho(); };
    window.addEventListener("user-updated", handleAll);
    window.addEventListener("storage", handleAll);
    window.addEventListener("cart-updated", atualizarCarrinho);

    return () => {
      window.removeEventListener("user-updated", handleAll);
      window.removeEventListener("storage", handleAll);
      window.removeEventListener("cart-updated", atualizarCarrinho);
    };
  }, []);

  return (
    <>
      <header className="cabecalho">
        <button className="icon-button" onClick={() => setDrawerOpen(true)}>
          <img src="imagem/menu.png" alt="Menu" className="icon" />
        </button>
        <img src="imagem/Marca.png" alt="Marca" className="marca" onClick={() => navigate("/")} />
        <div className="carrinho-container" onClick={() => navigate("/carrinho")}>
          <img src="imagem/carrinho.png" alt="Carrinho" className="icon carrinho" />
          <span className="cart-count">{cartCount}</span>
        </div>
      </header>

      <nav className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <div className="conta" onClick={() => navigate(usuario ? "/perfil" : "/login")} style={{ cursor: "pointer" }}>
          {usuario ? (
            <>
              {/* LÓGICA SIMPLIFICADA: Se tem foto, joga direto no src */}
              {(usuario.foto && usuario.foto.length > 20) ? (
                <img
                  key={Date.now()}
                  src={usuario.foto}
                  alt="Perfil"
                  style={{
                    width: "60px", height: "60px", borderRadius: "50%",
                    objectFit: "cover", border: "2px solid #fff",
                    display: "block", margin: "0 auto", backgroundColor: "#333"
                  }}
                  onError={(e) => {
                    console.error("❌ A imagem quebrou ao renderizar.");
                    e.target.style.display = 'none'; // Esconde se quebrar
                    // Aqui você poderia forçar mostrar a inicial se quisesse
                  }}
                />
              ) : (
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: "#fff", color: "#000", border: "2px solid #ccc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", fontWeight: "bold", margin: "0 auto"
                }}>
                  {getInicial(usuario.name)}
                </div>
              )}
              <p style={{ textAlign: "center", marginTop: "10px" }}>
                Olá, {usuario.name.split(" ")[0]}
              </p>
            </>
          ) : (
            <>
              <img
                src="imagem/users.png"
                alt="Deslogado"
                style={{
                  width: "60px",
                  margin: "0 auto",
                  display: "block",
                  filter: "brightness(0) invert(1)"
                }}
              />
              <p style={{ textAlign: "center", marginTop: "10px" }}>
                Entrar / Criar Conta
              </p>
            </>
          )}
        </div>

        <hr style={{ margin: "20px 0", borderColor: "#333" }} />
        <ul>
          <li onClick={() => { setDrawerOpen(false); navigate("/"); }}>Home</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/minhas-compras"); }}>Minhas Compras</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/ofertas"); }}>Ofertas</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/notificacoes"); }}>Notificações</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/favoritos"); }}>Favoritos</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/soccerpoints"); }}>Soccer Points</li>

        </ul>
      </nav>
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
    </>
  );
}