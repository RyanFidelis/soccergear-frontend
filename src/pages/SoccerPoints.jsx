import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SoccerPoints.css";

export default function SoccerPoints() {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [modalAtivo, setModalAtivo] = useState(false);
  const [brindeSelecionado, setBrindeSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  const brindes = [
    {
      id: 1,
      nome: "Chaveiro de Futebol",
      custo: 100,
      imagem: "https://carrefourbr.vtexassets.com/arquivos/ids/143273602/24130abb7a354a5fb9bbb54b743c0da2.jpg?v=638504454886130000",
      tag: "Popular",
    },
    {
      id: 2,
      nome: "Boné do Time",
      custo: 500,
      imagem: "https://th.bing.com/th/id/R.0c1cfa1de4ba155f4c9348f7cabefc82?rik=9Ucxy9QiFwxbzQ&pid=ImgRaw&r=0",
      tag: "Novo",
    },
    {
      id: 3,
      nome: "Camisa Oficial",
      custo: 1000,
      imagem: "https://photos.enjoei.com.br/camisa-brasil-22-23-copa-do-mundo/1200xN/czM6Ly9waG90b3MuZW5qb2VpLmNvbS5ici9wcm9kdWN0cy8yNTcxMzQ5Mi83YmMxNjg2ZGJlMTlhN2RiODY2MzFiMmFhMjZjNWViZi5qcGc",
      tag: "Premium",
    },
  ];

  const sincronizarDados = async () => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLocal || !usuarioLocal.id) {
        setPontos(0);
        setLoading(false);
        return;
    }
    try {
        const res = await fetch(`${API_URL}/api/clientes`); 
        if (res.ok) {
            const clientes = await res.json();
            const dadosAtualizados = clientes.find(c => c.id === usuarioLocal.id);
            if (dadosAtualizados) {
                setPontos(dadosAtualizados.pontos || 0);
                const usuarioMerge = { ...usuarioLocal, ...dadosAtualizados };
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioMerge));
            }
        }
    } catch (e) {
        console.error("Erro sync:", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const historicoSalvo = localStorage.getItem("historico-soccer-points");
    if (historicoSalvo) setHistorico(JSON.parse(historicoSalvo));
    sincronizarDados();
  }, []);

  const irParaCompras = () => {
    navigate("/");
  };

  const resgatarBrinde = async (brinde) => {
    if (pontos >= brinde.custo) {
        setLoading(true);
        const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
        const novosPontos = pontos - brinde.custo;
        
        try {
            const res = await fetch(`${API_URL}/api/auth/update/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pontos: novosPontos }),
            });

            if (res.ok) {
                setPontos(novosPontos);
                const userAtualizado = {...usuario, pontos: novosPontos};
                localStorage.setItem("usuarioLogado", JSON.stringify(userAtualizado));
                window.dispatchEvent(new Event("user-updated"));
                
                const novoHistorico = [...historico, { tipo: "Resgate", valor: -brinde.custo, data: new Date().toLocaleString(), item: brinde.nome }];
                setHistorico(novoHistorico);
                localStorage.setItem("historico-soccer-points", JSON.stringify(novoHistorico));
                
                setBrindeSelecionado(brinde);
                setModalAtivo(true);
            }
        } catch (e) {
            alert("Erro ao resgatar.");
        } finally {
            setLoading(false);
        }
    } else {
      alert("Pontos insuficientes!");
    }
  };

  return (
    <main className="container-soccer-points">
      <section className="hero-soccer-points">
        <div className="caixa-hero-soccer-points">
          <h1>Ganhe Pontos, Conquiste Prêmios!</h1>
          {/* Texto atualizado para a nova regra segura */}
          <p>A cada R$ 10,00 em compras aprovadas, você ganha 1 ponto.</p>
        </div>
        <div className="painel-pontos-soccer-points">
          <h2>Seus Pontos</h2>
          <p className="valor-pontos-soccer-points">{loading ? "..." : pontos}</p>
          <div className="barra-nivel-soccer-points">
            <div className="progresso-soccer-points" style={{ width: `${Math.min((pontos / 5000) * 100, 100)}%` }}></div>
          </div>
          <p className="meta-soccer-points">Limite máximo: 5000 pontos</p>
          <button className="btn-ganhar-soccer-points" onClick={irParaCompras}>
            Ir às Compras
          </button>
        </div>
      </section>

      <section className="brindes-soccer-points">
        <h2>Brindes Disponíveis</h2>
        <div className="grid-brindes-soccer-points">
          {brindes.map((brinde) => (
            <div key={brinde.id} className="card-brinde-soccer-points">
              {brinde.tag && <span className="tag-soccer-points">{brinde.tag}</span>}
              <img src={brinde.imagem} alt={brinde.nome} className="img-brinde-soccer-points" />
              <h3>{brinde.nome}</h3>
              <p className="pontos-necessarios-soccer-points"><strong>{brinde.custo}</strong> pontos</p>
              <button className="btn-resgatar-soccer-points" onClick={() => resgatarBrinde(brinde)} disabled={loading}>
                Trocar Agora
              </button>
            </div>
          ))}
        </div>
      </section>

      {modalAtivo && (
        <div className="modal-overlay-soccer-points" onClick={() => setModalAtivo(false)}>
          <div className="modal-soccer-points" onClick={(e) => e.stopPropagation()}>
            <h2>Parabéns!</h2>
            <p>Você resgatou: <strong>{brindeSelecionado?.nome}</strong></p>
            <img src={brindeSelecionado?.imagem} alt="" className="img-modal-soccer-points" />
            <button className="btn-fechar-soccer-points" onClick={() => setModalAtivo(false)}>Fechar</button>
          </div>
        </div>
      )}
    </main>
  );
}