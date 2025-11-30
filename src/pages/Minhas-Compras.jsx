import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Minhas-compras.css";

export default function MinhasCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "https://soccergear-backend.onrender.com";

  const carregarCompras = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario || !usuario.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/pedido/meus-pedidos/${usuario.id}`);
      if (!res.ok) throw new Error("Erro ao buscar pedidos");
      
      const pedidos = await res.json();

      if (Array.isArray(pedidos)) {
        const ordenados = pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCompras(ordenados);
      }
      setErro(null);
    } catch (error) {
      console.error("Erro ao carregar compras:", error);
      setErro("Não foi possível carregar seus pedidos. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCompras();
    
    const intervalo = setInterval(carregarCompras, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case "aprovado": return { label: "Confirmado", className: "status-aprovado", color: "#2ecc71" }; 
      case "rejeitado": return { label: "Cancelado", className: "status-rejeitado", color: "#e74c3c" }; 
      case "aguardando": default: return { label: "Em Análise", className: "status-pendente", color: "#f39c12" }; 
    }
  };

  const parseItens = (itensData) => {
    try {
      if (typeof itensData === 'string') return JSON.parse(itensData);
      return itensData;
    } catch (e) {
      return [];
    }
  };

  if (loading) return <div className="minhas-compras"><h2>Carregando pedidos...</h2></div>;

  if (erro) return <div className="minhas-compras"><h2 style={{color:'red'}}>{erro}</h2></div>;

  if (compras.length === 0) {
    return (
      <div className="minhas-compras">
        <center>
        <h2>Você ainda não tem compras registradas.</h2>
        <p>Seus pedidos aparecerão aqui logo após a finalização do pagamento.</p>
        <Link to="/" style={{marginTop: '20px', display: 'inline-block', padding: '10px', background: '#333', color: '#fff', textDecoration: 'none'}}>Ir para Loja</Link>
        </center>
      </div>
    );
  }

  return (
    <main className="minhas-compras">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Meus Pedidos</h1>
        <button onClick={carregarCompras} style={{padding: '5px 10px', cursor: 'pointer'}}>↻ Atualizar</button>
      </div>

      {compras.map((compra) => {
        const statusInfo = getStatusInfo(compra.status);
        const listaItens = parseItens(compra.itens);
        
        return (
          <div key={compra.id} className="compra" style={{ borderLeft: `6px solid ${statusInfo.color}` }}>
            <div className="compra-header">
              <h3>Pedido #{compra.id}</h3>
              <div style={{textAlign: 'right'}}>
                <span className="data-compra" style={{display:'block', fontSize:'0.85rem', color:'#666'}}>
                  {new Date(compra.createdAt || compra.updatedAt).toLocaleDateString('pt-BR')}
                </span>
                <span style={{ color: statusInfo.color, fontWeight: "bold", textTransform: 'uppercase', fontSize: '0.9rem' }}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
            
            <ul>
              {listaItens.map((item, i) => (
                <li key={i} className="compra-item">
                  <img src={item.imagem} alt={item.nome} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} />
                  <div className="compra-info">
                    <h4>{item.nome}</h4>
                    <p>Qtd: {item.quantity || 1} {item.tamanho ? `| Tam: ${item.tamanho}` : ""}</p>
                  </div>
                  <div className="compra-preco">
                    R$ {Number(item.preco).toFixed(2).replace(".", ",")}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="compra-total">
              Total: R$ {Number(compra.total).toFixed(2).replace(".", ",")}
            </div>
            <hr />
          </div>
        );
      })}
    </main>
  );
}