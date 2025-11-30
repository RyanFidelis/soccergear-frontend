import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../css/Notificacoes.css";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [modalLimparOpen, setModalLimparOpen] = useState(false);
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL;

  const checarAtualizacoesBackend = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario || !usuario.id) return;

    try {
      const res = await fetch(`${API_URL}/api/pedido/meus-pedidos/${usuario.id}`);
      if (!res.ok) return;

      const pedidos = await res.json();
      
      const notificacoesVisuais = JSON.parse(localStorage.getItem("notificacoes")) || [];
      const historicoIds = JSON.parse(localStorage.getItem("notificacoes_historico_ids")) || [];
      
      let novasNotificacoes = [...notificacoesVisuais];
      let novosIds = [...historicoIds];
      let houveMudanca = false;

      pedidos.forEach((pedido) => {
        const idEvento = `pedido-${pedido.id}-${pedido.status}`;

        const jaProcessado = novosIds.includes(idEvento);

        if (!jaProcessado) {
          if (pedido.status === "aprovado") {
            novasNotificacoes.unshift({
              id: Date.now() + Math.random(),
              idExterno: idEvento,
              titulo: "Pagamento Confirmado",
              descricao: `O pagamento do pedido #${pedido.id} foi aprovado! Em breve enviaremos seus produtos.`,
              categoria: "aprovado",
              lida: false,
              data: new Date(),
              dataFormatada: new Date().toLocaleString("pt-BR"),
            });
            novosIds.push(idEvento); 
            houveMudanca = true;

          } else if (pedido.status === "rejeitado") {
            novasNotificacoes.unshift({
              id: Date.now() + Math.random(),
              idExterno: idEvento,
              titulo: "Falha no Pagamento",
              descricao: `Não conseguimos processar o pagamento do pedido #${pedido.id}. Verifique seus dados.`,
              categoria: "rejeitado",
              lida: false,
              data: new Date(),
              dataFormatada: new Date().toLocaleString("pt-BR"),
            });
            novosIds.push(idEvento); 
            houveMudanca = true;
          }
        }
      });

      if (houveMudanca) {
        setNotificacoes(novasNotificacoes);
        localStorage.setItem("notificacoes", JSON.stringify(novasNotificacoes));
        localStorage.setItem("notificacoes_historico_ids", JSON.stringify(novosIds));
      }
    } catch (e) {
      console.error("Erro ao buscar notificações:", e);
    }
  };

  const gerarNotificacaoIA = async () => {
    if (!GEMINI_API_KEY) return;
    
    const hoje = new Date().toDateString();
    const iaHistorico = JSON.parse(localStorage.getItem("ia_notificacoes_data")) || "";
    
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const nomeUsuario = usuario ? (usuario.name || 'Cliente') : 'Cliente';
    const temas = ["oferta relâmpago", "cupom exclusivo", "lançamento chuteira"];
    const tema = temas[Math.floor(Math.random() * temas.length)];

    const prompt = `Crie uma notificação curta e engajadora sobre ${tema} para ${nomeUsuario}. JSON: {"titulo": "...", "descricao": "..."}`;
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      const { titulo, descricao } = JSON.parse(text);

      const nova = {
        id: Date.now(),
        titulo,
        descricao,
        categoria: "promocao",
        lida: false,
        data: new Date(),
        dataFormatada: new Date().toLocaleString("pt-BR")
      };

      setNotificacoes(prev => {
        const atualizadas = [nova, ...prev];
        localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
        return atualizadas;
      });
      localStorage.setItem("ia_notificacoes_data", hoje);

    } catch (e) {
      console.error("Erro IA:", e);
    }
  };

  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem("notificacoes")) || [];
    setNotificacoes(salvas);
    
    checarAtualizacoesBackend();
    
    const intervalBackend = setInterval(checarAtualizacoesBackend, 5000);
    const intervalIA = setInterval(gerarNotificacaoIA, 60000 * 15); // 15 min

    return () => {
      clearInterval(intervalBackend);
      clearInterval(intervalIA);
    };
  }, []);

  const confirmarLimpeza = () => {
    setNotificacoes([]);
    localStorage.removeItem("notificacoes");
    setModalLimparOpen(false);
  };

  const marcarComoLida = (n) => {
    const atualizadas = notificacoes.map(item => 
      item.id === n.id ? { ...item, lida: true } : item
    );
    setNotificacoes(atualizadas);
    localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
    setNotificacaoSelecionada(n);
  };

  const excluirUnica = (id) => {
    const atualizadas = notificacoes.filter(item => item.id !== id);
    setNotificacoes(atualizadas);
    localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
  };

  const marcarTodasLidas = () => {
    const atualizadas = notificacoes.map(n => ({...n, lida: true}));
    setNotificacoes(atualizadas);
    localStorage.setItem("notificacoes", JSON.stringify(atualizadas));
  };

  const listaFiltrada = notificacoes.filter(n => {
    if (filtro === 'todas') return true;
    if (filtro === 'nao-lidas') return !n.lida;
    return n.categoria === filtro;
  });

  return (
    <main className="notificacoes-container">
      <div className="notificacoes-header">
        <h2>Central de Notificações</h2>
        <div className="acoes-header">
          <button className="btn-acao ler-tudo" onClick={marcarTodasLidas}>Marcar todas como lidas</button>
          <button className="btn-acao limpar" onClick={() => setModalLimparOpen(true)}>Limpar tudo</button>
        </div>
      </div>

      <div className="filtros-bar">
        {['todas', 'nao-lidas', 'aprovado', 'rejeitado', 'promocao'].map(cat => (
          <button 
            key={cat} 
            className={`chip ${filtro === cat ? 'ativo' : ''}`}
            onClick={() => setFiltro(cat)}
          >
            {cat.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="lista-cards">
        {listaFiltrada.length === 0 ? (
          <div className="empty-state">
            <span style={{fontSize: "4rem"}}>🔔</span>
            <p>Nenhuma notificação.</p>
          </div>
        ) : (
          listaFiltrada.map(n => (
            <div key={n.id} className={`card-notificacao ${n.lida ? 'lida' : 'nao-lida'} ${n.categoria}`}>
              <div className="card-content" onClick={() => marcarComoLida(n)}>
                <div className="card-top">
                  <span className="card-title">{n.titulo}</span>
                  <span className="card-time">{new Date(n.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="card-desc">{n.descricao}</p>
              </div>
              <div className="card-actions">
                <button className="icon-btn ver" title="Ver Detalhes" onClick={() => marcarComoLida(n)}>👁</button>
                <button className="icon-btn del" title="Excluir" onClick={(e) => { e.stopPropagation(); excluirUnica(n.id); }}>🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Limpar Tudo */}
      {modalLimparOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Limpar notificações?</h3>
            <p>Isso removerá todas as notificações do seu histórico. Essa ação não pode ser desfeita.</p>
            <div className="modal-buttons">
              <button className="btn-secundario" onClick={() => setModalLimparOpen(false)}>Cancelar</button>
              <button className="btn-primario perigo" onClick={confirmarLimpeza}>Sim, limpar tudo</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {notificacaoSelecionada && (
        <div className="modal-overlay" onClick={() => setNotificacaoSelecionada(null)}>
          <div className="modal-box detalhes" onClick={e => e.stopPropagation()}>
            <div className="modal-header-detalhe">
               <h3>{notificacaoSelecionada.titulo}</h3>
               <button className="close-btn" onClick={() => setNotificacaoSelecionada(null)}>×</button>
            </div>
            <div className="modal-body">
               <span className={`badge ${notificacaoSelecionada.categoria}`}>{notificacaoSelecionada.categoria}</span>
               <p className="data-detalhe">{notificacaoSelecionada.dataFormatada}</p>
               <hr/>
               <p className="texto-completo">{notificacaoSelecionada.descricao}</p>
            </div>
            <div className="modal-buttons">
              <button className="btn-primario" onClick={() => setNotificacaoSelecionada(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}