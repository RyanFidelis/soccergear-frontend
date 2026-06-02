import React, { useEffect, useState } from "react";
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "../css/Minhas-compras.css";

export default function MinhasCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const carregarCompras = async () => {
    try {
      const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado")
      );

      if (!usuario || !usuario.id) {
        setErro("Usuário não encontrado");
        setLoading(false);
        return;
      }

      const API_URL = process.env.REACT_APP_API_URL;

      if (!API_URL) {
        setErro("API não configurada");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/pedido/meus-pedidos/${usuario.id}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos");
      }

      const pedidos = await response.json();

      console.log("PEDIDOS:", pedidos);

      if (Array.isArray(pedidos)) {
        const ordenados = pedidos.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

        setCompras(ordenados);
      } else {
        setCompras([]);
      }

      setErro(null);
    } catch (error) {
      console.error("Erro ao carregar compras:", error);

      setErro(
        "Não foi possível carregar seus pedidos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCompras();

    const intervalo = setInterval(() => {
      carregarCompras();
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case "aprovado":
        return {
          label: "Confirmado",
          color: "#2ecc71",
        };

      case "rejeitado":
        return {
          label: "Cancelado",
          color: "#e74c3c",
        };

      default:
        return {
          label: "Em Análise",
          color: "#f39c12",
        };
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
      if (typeof itensData === "string") {
        return JSON.parse(itensData);
      }

      return itensData || [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="minhas-compras">
        <h2>Carregando pedidos...</h2>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="minhas-compras">
        <h2 style={{ color: "red" }}>{erro}</h2>
      </div>
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
      <div className="minhas-compras">
        <h2>
          Você ainda não tem compras registradas.
        </h2>

        <p>
          Seus pedidos aparecerão aqui após a
          finalização do pagamento.
        </p>

        <Link
          to="/"
          style={{
            marginTop: "20px",
            display: "inline-block",
            padding: "10px",
            background: "#333",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Ir para Loja
        </Link>
      </div>
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Meus Pedidos</h1>

        <button
          onClick={carregarCompras}
          style={{
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Atualizar
        </button>
      </div>

      {compras.map((compra) => {
        const statusInfo = getStatusInfo(
          compra.status
        );

        const listaItens = parseItens(
          compra.itens
        );

        return (
          <div
            key={compra.id}
            className="compra"
            style={{
              borderLeft: `6px solid ${statusInfo.color}`,
            }}
          >
            <div className="compra-header">
              <h3>Pedido #{compra.id}</h3>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "#666",
                  }}
                >
                  {new Date(
                    compra.createdAt ||
                      compra.updatedAt
                  ).toLocaleDateString("pt-BR")}
                </span>

                <span
                  style={{
                    color: statusInfo.color,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                  }}
                >
      <div className="page-header">
        <h1>Meus Pedidos</h1>
        <button onClick={carregarCompras} className="btn-refresh">
          ↻ Atualizar
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
                  <span>{new Date(compra.createdAt).toLocaleDateString('pt-BR')}</span>
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

            <ul>
              {listaItens.map((item, i) => (
                <li
                  key={i}
                  className="compra-item"
                >
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />

                  <div className="compra-info">
                    <h4>{item.nome}</h4>

                    <p>
                      Qtd:{" "}
                      {item.quantity || 1}

                      {item.tamanho
                        ? ` | Tam: ${item.tamanho}`
                        : ""}
                    </p>
                  </div>

                  <div className="compra-preco">
                    R${" "}
                    {Number(item.preco)
                      .toFixed(2)
                      .replace(".", ",")}
                  </div>
                </li>
              ))}
            </ul>

            <div className="compra-total">
              Total: R${" "}
              {Number(compra.total)
                .toFixed(2)
                .replace(".", ",")}
            </div>

            <hr />
          </div>
        );
      })}
          );
        })}
      </div>
    </main>
  );
}
