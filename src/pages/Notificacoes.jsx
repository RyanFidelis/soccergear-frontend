import React, { useEffect, useState } from "react";
import "../css/Notificacoes.css";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  const checarAtualizacoesBackend = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario || !usuario.id) return;

    try {
      const API_URL = "https://soccergear-backend.onrender.com";

      const res = await fetch(
        `${API_URL}/api/pedido/meus-pedidos/${usuario.id}`
      );

      if (!res.ok) return;

      const pedidos = await res.json();

      const notificacoesSalvas =
        JSON.parse(localStorage.getItem("notificacoes")) || [];

      let novas = [...notificacoesSalvas];
         const notificacoesExistentes = new Set(
        notificacoesSalvas.map(n => n.idExterno)
       );
      let houveMudanca = false;

      pedidos.forEach((pedido) => {
       const statusPedido = String(pedido.status || "").trim().toLowerCase();

        const idNotificacao = `pedido-${pedido.id}-${statusPedido}`;

        const jaExiste = notificacoesExistentes.has(idNotificacao);
        if (!jaExiste) {

if (
  statusPedido === "aguardando" ||
  statusPedido === "analise" ||
  statusPedido === "em análise" ||
  statusPedido === "em_analise"
) {

  const nomeProduto =
    pedido.itens?.[0]?.nome ||
    pedido.produtos?.[0]?.nome ||
    "Produto";

  novas.unshift({
    id: crypto.randomUUID(),
    idExterno: idNotificacao,
    titulo: "Pagamento em análise",
    descricao: `Seu pedido #${pedido.id} do produto "${nomeProduto}" está aguardando aprovação.`,
    categoria: "pendente",
    lida: false,
    data: new Date().toISOString(),
    dataFormatada: new Date().toLocaleString("pt-BR")
  });

  houveMudanca = true;
}

          else if (statusPedido === "aprovado") {

            novas.unshift({
              id: crypto.randomUUID(),
              idExterno: idNotificacao,
              titulo: "Pagamento Aprovado!",
              descricao: `Seu pedido #${pedido.id} do produto "${pedido.itens?.[0]?.nome || pedido.produtos?.[0]?.nome || "Produto"}" foi confirmado.`,
              categoria: "aprovado",
              lida: false,
              data: Date.now(),
              dataFormatada: new Date().toLocaleString("pt-BR")
            });

            houveMudanca = true;
          }

          else if (
            statusPedido === "rejeitado" ||
            statusPedido === "recusado"
          ) {

            novas.unshift({
              id: crypto.randomUUID(),
              idExterno: idNotificacao,
              titulo: "Pedido Recusado",
              descricao: `Houve um problema com o pedido #${pedido.id} do produto "${pedido.itens?.[0]?.nome || pedido.produtos?.[0]?.nome || "Produto"}".`,
              categoria: "rejeitado",
              lida: false,
              data: Date.now(),
              dataFormatada: new Date().toLocaleString("pt-BR")
            });

            houveMudanca = true;
          }
        }
      });

      if (houveMudanca) {
        setNotificacoes(novas);
        localStorage.setItem("notificacoes", JSON.stringify(novas));
      }

    } catch (e) {
      console.error("Erro no sync de notificações:", e);
    }
  };

  useEffect(() => {
    const salvas =
      JSON.parse(localStorage.getItem("notificacoes")) || [];

    const processadas = salvas.map((n) => ({
      ...n,
      data: Number(n.data)
    }));

    setNotificacoes(processadas);

    checarAtualizacoesBackend();

    const intervalo = setInterval(
      checarAtualizacoesBackend,
      5000
    );

    return () => clearInterval(intervalo);
  }, []);

  const marcarTodasLidas = () => {
    const atualizadas = notificacoes.map((n) => ({
      ...n,
      lida: true
    }));

    setNotificacoes(atualizadas);

    localStorage.setItem(
      "notificacoes",
      JSON.stringify(atualizadas)
    );
  };

  const limparNotificacoes = () => {
    if (window.confirm("Limpar tudo?")) {
      setNotificacoes([]);
      localStorage.removeItem("notificacoes");
    }
  };

  const marcarComoLida = (id) => {
    const atualizadas = notificacoes.map((n) =>
      n.id === id ? { ...n, lida: true } : n
    );

    setNotificacoes(atualizadas);

    localStorage.setItem(
      "notificacoes",
      JSON.stringify(atualizadas)
    );
  };

  const excluirNotificacao = (id) => {
    const atualizadas = notificacoes.filter(
      (n) => n.id !== id
    );

    setNotificacoes(atualizadas);

    localStorage.setItem(
      "notificacoes",
      JSON.stringify(atualizadas)
    );
  };

  const notificacoesFiltradas = notificacoes
    .filter((n) => {
      if (filtro === "todas") return true;
      if (filtro === "nao-lidas") return !n.lida;
      return n.categoria === filtro;
    })
    .sort((a, b) => b.data - a.data);

  return (
    <main className="notificacoes-container">
      <div className="notificacoes-header">
        <h1>Notificações</h1>

        <div>
          <button
            onClick={marcarTodasLidas}
            className="btn-acao"
          >
            Marcar lidas
          </button>

          <button
            onClick={limparNotificacoes}
            className="btn-acao primario"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="filtros-notificacoes">
        {[
          "todas",
          "nao-lidas",
          "pendente",
          "aprovado",
          "rejeitado"
        ].map((f) => (
          <button
            key={f}
            className={`filtro-btn ${
              filtro === f ? "ativo" : ""
            }`}
            onClick={() => setFiltro(f)}
          >
            {f === "todas"
              ? "Todas"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="lista-notificacoes">
        {notificacoesFiltradas.length === 0 ? (
          <p>Nenhuma notificação encontrada.</p>
        ) : (
          notificacoesFiltradas.map((n) => (
            <div
              key={n.id}
              className={`notificacao-item ${
                n.lida ? "lida" : ""
              } ${n.categoria}`}
            >
              <div className="notificacao-conteudo">
                <div className="notificacao-titulo">
                  {n.titulo}
                </div>

                <div className="notificacao-descricao">
                  {n.descricao}
                </div>

                <div className="notificacao-meta">
                  <span>{n.dataFormatada}</span>
                </div>

                {!n.lida && (
                  <button
                    className="btn-notificacao acao-ler"
                    onClick={() => marcarComoLida(n.id)}
                  >
                    Ok
                  </button>
                )}

                <button
                  className="btn-notificacao excluir"
                  onClick={() => excluirNotificacao(n.id)}
                >
                  X
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}