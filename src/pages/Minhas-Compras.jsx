import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "../css/Minhas-compras.css";

export default function MinhasCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarCompras = useCallback(async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario || !usuario.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://soccergear-backend.onrender.com/api/pedido/meus-pedidos/${usuario.id}`);
      
      if (!res.ok) {
        throw new Error(`Erro do Servidor: ${res.status}`);
      }
      
      const pedidos = await res.json();

      if (Array.isArray(pedidos)) {
        const pedidosAtivos = pedidos.filter(p => {
            const s = p.status ? p.status.toLowerCase() : "";
            return s !== 'rejeitado' && s !== 'cancelado';
        });

        const ordenados = pedidosAtivos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCompras(ordenados);
      }
      setErro(null);
    } catch (error) {
      console.error(error); 
      setErro("Erro ao conectar com o servidor online.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCompras();
    const intervalo = setInterval(carregarCompras, 3000);
    return () => clearInterval(intervalo);
  }, [carregarCompras]);

  const getStatusInfo = (status) => {
    const s = status ? status.toLowerCase() : "";
    switch (s) {
      case "aprovado": return { label: "Confirmado", className: "status-aprovado" };
      case "pago": return { label: "Confirmado", className: "status-aprovado" };
      case "rejeitado": return { label: "Cancelado", className: "status-rejeitado" };
      case "aguardando": default: return { label: "Em Análise", className: "status-pendente" };
    }
  };

  const parseItens = (itensData) => {
    try {
      if (typeof itensData === 'string') return JSON.parse(itensData);
      return itensData;
    } catch (e) { return []; }
  };

  if (loading) return <div className="minhas-compras"><div className="empty-state"><h2>Carregando seus pedidos</h2></div></div>;
  
  if (erro) {
    return (
        <div className="minhas-compras">
            <div className="empty-state">
                <button onClick={carregarCompras} className="btn-refresh">Tentar Novamente</button>
            </div>
        </div>
    );
  }

  if (compras.length === 0) {
    return (
      <main className="minhas-compras">
        <div className="page-header"><h1>Meus Pedidos</h1></div>
        <div className="empty-state">
           <h2>Nenhum pedido ativo encontrado.</h2>
           <p>Pedidos recusados não são exibidos nesta lista.</p>
           <Link to="/" style={{color: '#333', textDecoration:'underline', fontWeight:'bold'}}>Ir às compras</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="minhas-compras">
      <div className="page-header">
        <h1>Meus Pedidos</h1>
        <button onClick={carregarCompras} className="btn-refresh">
          ↻ Atualizar Status
        </button>
      </div>

      <div className="lista-pedidos">
        {compras.map((compra) => {
          const statusInfo = getStatusInfo(compra.status);
          const listaItens = parseItens(compra.itens);
          const primeiroItem = listaItens[0] || { nome: "Pedido", imagem: null };
          const qtdOutros = listaItens.length - 1;

          return (
            <div key={compra.id} className="compra-row">
              <div className="row-img-container">
                {primeiroItem.imagem ? (
                  <img src={primeiroItem.imagem} alt={primeiroItem.nome} />
                ) : (
                  <span style={{fontSize:'24px'}}>📦</span>
                )}
              </div>

              <div className="row-details">
                <div className="pedido-titulo">
                  {primeiroItem.nome}
                  {qtdOutros > 0 && <span style={{fontWeight:'normal', color:'#888', fontSize:'14px'}}> (+{qtdOutros} itens)</span>}
                </div>
                <div className="pedido-meta">
                  <span className="pedido-id">#{compra.id}</span>
                  <span>• {new Date(compra.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="row-price">
                R$ {Number(compra.total).toFixed(2).replace(".", ",")}
              </div>

              <div className="row-status">
                <span className={`status-badge ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}