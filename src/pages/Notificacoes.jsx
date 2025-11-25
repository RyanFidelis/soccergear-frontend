import React, { useEffect, useState } from "react";
import "../css/Notificacoes.css";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  // Função para verificar status real no Banco de Dados
  const checarAtualizacoesBackend = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario || !usuario.id) return;

    try {
      const res = await fetch(`http://localhost:3001/api/pedido/meus-pedidos/${usuario.id}`);
      if (!res.ok) return;
      
      const pedidos = await res.json();
      const notificacoesSalvas = JSON.parse(localStorage.getItem("notificacoes")) || [];
      let novas = [...notificacoesSalvas];
      let houveMudanca = false;

      pedidos.forEach(pedido => {
        // Gera IDs únicos para não repetir notificação do mesmo status
        const idNotificacao = `pedido-${pedido.id}-${pedido.status}`;
        
        // Verifica se já notificamos esse status específico
        const jaExiste = novas.some(n => n.idExterno === idNotificacao);

        if (!jaExiste) {
          if (pedido.status === 'aprovado') {
            novas.unshift({
              id: Date.now() + Math.random(),
              idExterno: idNotificacao,
              titulo: "✅ Pagamento Aprovado!",
              descricao: `Seu pedido #${pedido.id} foi confirmado. Total: R$ ${Number(pedido.total).toFixed(2)}`,
              categoria: "aprovado",
              lida: false,
              data: new Date(),
              dataFormatada: new Date().toLocaleString("pt-BR")
            });
            houveMudanca = true;
          } else if (pedido.status === 'rejeitado') {
            novas.unshift({
              id: Date.now() + Math.random(),
              idExterno: idNotificacao,
              titulo: "❌ Pedido Recusado",
              descricao: `Houve um problema com o pedido #${pedido.id}.`,
              categoria: "rejeitado",
              lida: false,
              data: new Date(),
              dataFormatada: new Date().toLocaleString("pt-BR")
            });
            houveMudanca = true;
          } else if (pedido.status === 'aguardando') {
             // Opcional: Notificar que o pedido entrou em análise se ainda não foi notificado
             // (Geralmente o Pagamento.jsx já faz isso manualmente)
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
    // 1. Carrega inicial
    const salvas = JSON.parse(localStorage.getItem("notificacoes")) || [];
    const processadas = salvas.map(n => ({...n, data: new Date(n.data)}));
    setNotificacoes(processadas);

    // 2. Verifica Backend imediatamente
    checarAtualizacoesBackend();

    // 3. Verifica a cada 5 segundos (Polling)
    const intervalo = setInterval(checarAtualizacoesBackend, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // --- Funções de Interface (Iguais às anteriores) ---
  const marcarTodasLidas = () => {
    const atualizadas = notificacoes.map((n) => ({ ...n, lida: true }));
    setNotificacoes(atualizadas);
    localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
  };

  const limparNotificacoes = () => {
    if (window.confirm("Limpar tudo?")) {
      setNotificacoes([]);
      localStorage.removeItem("notificacoes");
    }
  };

  const marcarComoLida = (id) => {
    const atualizadas = notificacoes.map((n) => n.id === id ? { ...n, lida: true } : n);
    setNotificacoes(atualizadas);
    localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
  };

  const excluirNotificacao = (id) => {
    const atualizadas = notificacoes.filter((n) => n.id !== id);
    setNotificacoes(atualizadas);
    localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
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
          <button onClick={marcarTodasLidas} className="btn-acao">Marcar lidas</button>
          <button onClick={limparNotificacoes} className="btn-acao primario">Limpar</button>
        </div>
      </div>

      <div className="filtros-notificacoes">
        {["todas", "nao-lidas", "aprovado", "rejeitado"].map((f) => (
          <button key={f} className={`filtro-btn ${filtro === f ? "ativo" : ""}`} onClick={() => setFiltro(f)}>
            {f === "todas" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="lista-notificacoes">
        {notificacoesFiltradas.length === 0 ? <p>Nenhuma notificação encontrada.</p> : notificacoesFiltradas.map((n) => (
            <div key={n.id} className={`notificacao-item ${n.lida ? "lida" : ""} ${n.categoria}`}>
              <div className="notificacao-conteudo">
                <div className="notificacao-titulo">{n.titulo}</div>
                <div className="notificacao-descricao">{n.descricao}</div>
                <div className="notificacao-meta">
                   <span>{n.dataFormatada}</span>
                </div>
                {!n.lida && <button className="btn-notificacao acao-ler" onClick={() => marcarComoLida(n.id)}>Ok</button>}
                <button className="btn-notificacao excluir" onClick={() => excluirNotificacao(n.id)}>X</button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}