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

  const getCartKey = (user) => {
    return user && user.id ? `cart_${user.id}` : "cart_guest";
  };

  const fetchUsuarioDoBanco = async () => {
    const saved = localStorage.getItem("usuarioLogado");
    if (!saved) { 
      setUsuario(null); 
      atualizarCarrinho(null);
      return; 
    }

    try {
      const userLocal = JSON.parse(saved);
      if (!userLocal?.id) {
        atualizarCarrinho(null);
        return;
      }

      const res = await fetch(`http://localhost:3001/api/auth/user/${userLocal.id}?_t=${Date.now()}`);

      if (res.ok) {
        const userBanco = await res.json();
        setUsuario(userBanco);
        localStorage.setItem("usuarioLogado", JSON.stringify(userBanco));
        atualizarCarrinho(userBanco);
      } else {
        setUsuario(userLocal);
        atualizarCarrinho(userLocal);
      }
    } catch (error) {
      console.error("Erro Header:", error);
      const userLocal = JSON.parse(saved);
      setUsuario(userLocal);
      atualizarCarrinho(userLocal);
    }
  };

  const atualizarCarrinho = (userContext) => {
    // Se userContext não for passado, tenta pegar do state ou localStorage
    let currentUser = userContext;
    if (currentUser === undefined) {
        const saved = localStorage.getItem("usuarioLogado");
        currentUser = saved ? JSON.parse(saved) : null;
    }

    const key = getCartKey(currentUser);
    const cart = JSON.parse(localStorage.getItem(key)) || [];
    setCartCount(cart.reduce((total, item) => total + (item.quantity || 1), 0));
  };

  useEffect(() => {
    fetchUsuarioDoBanco();

    const handleUserUpdate = () => { fetchUsuarioDoBanco(); };
    const handleStorage = (e) => {
        fetchUsuarioDoBanco();
        // Se a mudança for no carrinho atual, atualiza o contador
        const currentUser = JSON.parse(localStorage.getItem("usuarioLogado"));
        const key = getCartKey(currentUser);
        if (e.key === key || e.key === "usuarioLogado") {
            atualizarCarrinho(currentUser);
        }
    };
    
    // Escuta evento personalizado disparado pelo Carrinho.jsx
    const handleCartUpdated = () => {
        const currentUser = JSON.parse(localStorage.getItem("usuarioLogado"));
        atualizarCarrinho(currentUser);
    };

    window.addEventListener("user-updated", handleUserUpdate);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cart-updated", handleCartUpdated);
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
                    e.target.style.display = 'none'; 
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
          <li onClick={() => { setDrawerOpen(false); navigate("/cupons"); }}>Cupons</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/notificacoes"); }}>Notificações</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/favoritos"); }}>Favoritos</li>
          <li onClick={() => { setDrawerOpen(false); navigate("/soccerpoints"); }}>Soccer Points</li>
        </ul>
      </nav>
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
    </>
  );
}