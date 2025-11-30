import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./componentes/Header";
import Footer from "./componentes/Footer";

// Páginas principais
import Home from "./pages/Home";
import Carrinho from "./pages/Carrinho";
import VerProduto from "./pages/Verproduto";
import MinhasCompras from "./pages/Minhas-Compras";
import Ofertas from "./pages/Ofertas";
import Notificacoes from "./pages/Notificacoes";
import Cupons from "./pages/Cupons";
import Favoritos from "./pages/Favoritos";
import SoccerPoints from "./pages/SoccerPoints";
import Pagamento from "./pages/Pagamento";   
import Provador from "./pages/provador/Provador";   

// Páginas de usuário
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";


// ======== Função de proteção de rota ========
function RotaProtegida({ children }) {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  return usuarioLogado ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="page-container">
      <Header />

      <main className="content-wrap">
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/verproduto" element={<VerProduto />} />
          <Route path="/pagamento" element={<Pagamento />} /> 
          <Route path="/minhas-compras" element={<MinhasCompras />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/cupons" element={<Cupons />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/soccerpoints" element={<SoccerPoints />} />
          <Route path="/provador" element={<Provador />} />

          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          <Route
            path="/perfil"
            element={
              <RotaProtegida>
                <Perfil />
              </RotaProtegida>
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
