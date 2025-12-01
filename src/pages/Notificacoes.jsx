import React, { useEffect, useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../css/Notificacoes.css";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const API_URL = "https://soccergear-backend.onrender.com";

const getUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch (e) {
    return null;
  }
};

const getStorageKeys = (userId) => ({
  keyNotificacoes: `notificacoes_${userId}`,
  keyHistoricoIds: `notificacoes_historico_ids_${userId}`,
  keyLastIATime: `ia_last_generation_${userId}`
});

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [modalLimparOpen, setModalLimparOpen] = useState(false);
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState(null);
  
  const checarAtualizacoesBackend = useCallback(async () => {
    const usuario = getUsuario();
    if (!usuario || !usuario.id) return;

    const { keyNotificacoes, keyHistoricoIds } = getStorageKeys(usuario.id);

    try {
      const res = await fetch(`${API_URL}/api/pedido/meus-pedidos/${usuario.id}`);
      if (!res.ok) return;

      const pedidos = await res.json();
      
      const notificacoesSalvas = JSON.parse(localStorage.getItem(keyNotificacoes)) || [];
      const historicoIds = JSON.parse(localStorage.getItem(keyHistoricoIds)) || [];
      
      let novasNotificacoes = [...notificacoesSalvas];
      let novosIds = [...historicoIds];
      let houveMudanca = false;

      pedidos.forEach((pedido) => {
        const status = pedido.status ? pedido.status.toLowerCase() : "";
        const idEvento = `pedido-${pedido.id}-${status}`;
        const jaProcessado = novosIds.includes(idEvento);

        if (!jaProcessado) {
          const valorFormatado = pedido.total ? Number(pedido.total).toFixed(2).replace('.', ',') : "0,00";

          if (status === "aprovado" || status === "pago") {
            novasNotificacoes.unshift({
              id: Date.now() + Math.random(),
              idExterno: idEvento,
              titulo: "✓ Pagamento Confirmado",
              descricao: `O pagamento de R$ ${valorFormatado} do pedido #${pedido.id} foi aprovado!`,
              categoria: "aprovado",
              lida: false,
              data: new Date(),
              dataFormatada: new Date().toLocaleString("pt-BR"),
            });
            novosIds.push(idEvento); 
            houveMudanca = true;

          } else if (status === "rejeitado" || status === "cancelado") {
            novasNotificacoes.unshift({
              id: Date.now() + Math.random(),
              idExterno: idEvento,
              titulo: "✕ Falha no Pagamento",
              descricao: `O pagamento de R$ ${valorFormatado} referente ao pedido #${pedido.id} foi recusado.`,
              categoria: "rejeitado",
              lida: false,
              data: new Date(),
              dataFormatada: new Date().toLocaleString("pt-BR"),
            });
            novosIds.push(idEvento); 
            houveMudanca = true;
          
          } else if (status === "aguardando" || status === "pendente") {
            novasNotificacoes.unshift({
              id: Date.now() + Math.random(),
              idExterno: idEvento,
              titulo: "Pagamento em Análise",
              descricao: `Estamos processando o pagamento de R$ ${valorFormatado} do pedido #${pedido.id}.`,
              categoria: "aguardando",
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
        localStorage.setItem(keyNotificacoes, JSON.stringify(novasNotificacoes));
        localStorage.setItem(keyHistoricoIds, JSON.stringify(novosIds));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const gerarNotificacaoIA = useCallback(async () => {
    if (!GEMINI_API_KEY) return;
    
    const usuario = getUsuario();
    if (!usuario || !usuario.id) return;

    const { keyNotificacoes, keyLastIATime } = getStorageKeys(usuario.id);
    const lastTime = localStorage.getItem(keyLastIATime);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000; 
    const nomeUsuario = usuario.name || 'Atleta';

    const criarPrompt = (tema) => `Crie uma notificação curta e empolgante para um e-commerce de futebol chamado SoccerGear. 
      O cliente se chama ${nomeUsuario}. O tema é: ${tema}.
      Responda APENAS um JSON válido neste formato: {"titulo": "...", "descricao": "..."}`;

    const gerarUnica = async (tema) => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(criarPrompt(tema));
        const text = result.response.text().replace(/```json|```/g, '').trim();
        const { titulo, descricao } = JSON.parse(text);
        return {
          id: Date.now() + Math.random(),
          titulo,
          descricao,
          categoria: "promocao",
          lida: false,
          data: new Date(),
          dataFormatada: new Date().toLocaleString("pt-BR")
        };
    };

    try {
        if (!lastTime) {
            const temasIniciais = ["boas-vindas ao time", "cupom de primeira compra", "lançamento de chuteira"];
            const promises = temasIniciais.map(tema => gerarUnica(tema));
            const resultados = await Promise.all(promises);

            setNotificacoes(prev => {
                const atualizadas = [...resultados, ...prev];
                localStorage.setItem(keyNotificacoes, JSON.stringify(atualizadas));
                return atualizadas;
            });
            localStorage.setItem(keyLastIATime, now.toString());
        } 
        else if (now - Number(lastTime) > ONE_HOUR) {
            const temas = ["oferta relâmpago", "dica de treino", "curiosidade futebol", "camisa retrô"];
            const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
            const nova = await gerarUnica(temaAleatorio);

            setNotificacoes(prev => {
                const atualizadas = [nova, ...prev];
                localStorage.setItem(keyNotificacoes, JSON.stringify(atualizadas));
                return atualizadas;
            });
            localStorage.setItem(keyLastIATime, now.toString());
        }
    } catch (e) {
      console.error("Erro IA:", e);
    }
  }, []);

  useEffect(() => {
    const usuario = getUsuario();
    if (usuario && usuario.id) {
      const { keyNotificacoes } = getStorageKeys(usuario.id);
      
      const salvas = JSON.parse(localStorage.getItem(keyNotificacoes)) || [];
      const processadas = salvas.map(n => ({...n, data: new Date(n.data)}));
      setNotificacoes(processadas);
      
      checarAtualizacoesBackend();
      gerarNotificacaoIA();

      const intervalBackend = setInterval(checarAtualizacoesBackend, 5000);
      const intervalIA = setInterval(gerarNotificacaoIA, 60000);

      return () => {
        clearInterval(intervalBackend);
        clearInterval(intervalIA);
      };
    } else {
      setNotificacoes([]);
    }
  }, [checarAtualizacoesBackend, gerarNotificacaoIA]);

  const confirmarLimpeza = () => {
    const usuario = getUsuario();
    if (usuario) {
      const { keyNotificacoes, keyLastIATime } = getStorageKeys(usuario.id);
      setNotificacoes([]);
      localStorage.removeItem(keyNotificacoes);
      localStorage.removeItem(keyLastIATime); 
    }
    setModalLimparOpen(false);
  };

  const marcarComoLida = (n) => {
    const usuario = getUsuario();
    const atualizadas = notificacoes.map(item => item.id === n.id ? { ...item, lida: true } : item);
    setNotificacoes(atualizadas);
    
    if (usuario) {
       const { keyNotificacoes } = getStorageKeys(usuario.id);
       localStorage.setItem(keyNotificacoes, JSON.stringify(atualizadas));
    }
    setNotificacaoSelecionada(n);
  };

  const excluirUnica = (id) => {
    const usuario = getUsuario();
    const atualizadas = notificacoes.filter(item => item.id !== id);
    setNotificacoes(atualizadas);

    if (usuario) {
      const { keyNotificacoes } = getStorageKeys(usuario.id);
      localStorage.setItem(keyNotificacoes, JSON.stringify(atualizadas));
    }
  };

  const marcarTodasLidas = () => {
    const usuario = getUsuario();
    const atualizadas = notificacoes.map(n => ({...n, lida: true}));
    setNotificacoes(atualizadas);

    if (usuario) {
      const { keyNotificacoes } = getStorageKeys(usuario.id);
      localStorage.setItem(keyNotificacoes, JSON.stringify(atualizadas));
    }
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
        {['todas', 'nao-lidas', 'aprovado', 'rejeitado', 'aguardando', 'promocao'].map(cat => (
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
            <p>Nenhuma notificação encontrada.</p>
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

      {modalLimparOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Limpar notificações?</h3>
            <p>Isso removerá todas as notificações e reiniciará o ciclo da IA.</p>
            <div className="modal-buttons">
              <button className="btn-secundario" onClick={() => setModalLimparOpen(false)}>Cancelar</button>
              <button className="btn-primario perigo" onClick={confirmarLimpeza}>Sim, limpar tudo</button>
            </div>
          </div>
        </div>
      )}

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