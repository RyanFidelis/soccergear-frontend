import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SoccerPoints.css";

export default function SoccerPoints() {
  const navigate = useNavigate();
<<<<<<< HEAD

  const [pontos, setPontos] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [modalAtivo, setModalAtivo] = useState(false);
  const [brindeSelecionado, setBrindeSelecionado] =
    useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const LIMITE_PONTOS = 5000;
=======
  const [pontos, setPontos] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [modalAtivo, setModalAtivo] = useState(false);
  const [brindeSelecionado, setBrindeSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "https://soccergear-backend.onrender.com";
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db

  const brindes = [
    {
      id: 1,
      nome: "Chaveiro de Futebol",
      custo: 100,
<<<<<<< HEAD
      imagem:
        "https://carrefourbr.vtexassets.com/arquivos/ids/143273602/24130abb7a354a5fb9bbb54b743c0da2.jpg?v=638504454886130000",
=======
      imagem: "https://carrefourbr.vtexassets.com/arquivos/ids/143273602/24130abb7a354a5fb9bbb54b743c0da2.jpg?v=638504454886130000",
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
      tag: "Popular",
    },
    {
      id: 2,
      nome: "Boné do Time",
      custo: 500,
<<<<<<< HEAD
      imagem:
        "https://tse3.mm.bing.net/th/id/OIP.7_pPC4rg5uFEumxbvUjNaQHaHa?cb=thfc1falcon&rs=1&pid=ImgDetMain&o=7&rm=3",
=======
      imagem: "https://th.bing.com/th/id/R.0c1cfa1de4ba155f4c9348f7cabefc82?rik=9Ucxy9QiFwxbzQ&pid=ImgRaw&r=0",
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
      tag: "Novo",
    },
    {
      id: 3,
      nome: "Camisa Oficial",
      custo: 1000,
<<<<<<< HEAD
      imagem:
        "https://photos.enjoei.com.br/camisa-brasil-22-23-copa-do-mundo/1200xN/czM6Ly9waG90b3MuZW5qb2VpLmNvbS5ici9wcm9kdWN0cy8yNTcxMzQ5Mi83YmMxNjg2ZGJlMTlhN2RiODY2MzFiMmFhMjZjNWViZi5qcGc",
=======
      imagem: "https://photos.enjoei.com.br/camisa-brasil-22-23-copa-do-mundo/1200xN/czM6Ly9waG90b3MuZW5qb2VpLmNvbS5ici9wcm9kdWN0cy8yNTcxMzQ5Mi83YmMxNjg2ZGJlMTlhN2RiODY2MzFiMmFhMjZjNWViZi5qcGc",
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
      tag: "Premium",
    },
  ];

<<<<<<< HEAD
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const usuarioLogado = JSON.parse(
        localStorage.getItem("usuarioLogado")
      );

      if (!usuarioLogado?.id) {
        console.error("Usuário não encontrado");
        return;
      }

      if (!API_URL) {
        console.error(
          "REACT_APP_API_URL não configurada"
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/auth/user/${usuarioLogado.id}`
      );

      const texto = await response.text();

      let data;

      try {
        data = JSON.parse(texto);
      } catch {
        console.error(
          "Resposta inválida do servidor:",
          texto
        );
        return;
      }

      if (!response.ok) {
        console.error("Erro do backend:", data);
        return;
      }

      const usuario =
        data.user || data.usuario || data;

      const pontosUsuario = Math.min(
        Number(usuario.pontos || 0),
        LIMITE_PONTOS
      );

      setPontos(pontosUsuario);

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          ...usuario,
          pontos: pontosUsuario,
        })
      );

      const historicoSalvo = localStorage.getItem(
        `historico-soccer-points-${usuario.id}`
      );

      if (historicoSalvo) {
        setHistorico(JSON.parse(historicoSalvo));
      }
    } catch (error) {
      console.error(
        "Erro ao buscar pontos:",
        error
      );
=======
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
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    const usuarioLogado = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!usuarioLogado?.id) return;

    localStorage.setItem(
      `historico-soccer-points-${usuarioLogado.id}`,
      JSON.stringify(historico)
    );
  }, [historico]);

  const irParaHome = () => {
    navigate("/");
  };

  const resgatarBrinde = (brinde) => {
    if (pontos < brinde.custo) {
      alert(
        "Você não tem pontos suficientes."
      );
      return;
    }

    const novosPontos = pontos - brinde.custo;

    setPontos(novosPontos);

    const usuarioLogado = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (usuarioLogado) {
      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify({
          ...usuarioLogado,
          pontos: novosPontos,
        })
      );
    }

    const novoHistorico = [
      ...historico,
      {
        tipo: "Resgate",
        valor: -brinde.custo,
        data: new Date().toLocaleString(),
        item: brinde.nome,
      },
    ];

    setHistorico(novoHistorico);

    setBrindeSelecionado(brinde);

    setModalAtivo(true);
  };

  const fecharModal = () => {
    setModalAtivo(false);
=======
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
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
  };

  return (
    <main className="container-soccer-points">
      <section className="hero-soccer-points">
        <div className="caixa-hero-soccer-points">
<<<<<<< HEAD
          <h1>
            Ganhe Pontos, Conquiste Prêmios!
          </h1>

          <p>
            A cada compra você acumula pontos
            para trocar por brindes exclusivos
            do mundo do futebol.
          </p>
        </div>

        <div className="painel-pontos-soccer-points">
          <h2>Seus Pontos</h2>

          <p className="valor-pontos-soccer-points">
            {pontos}
          </p>

          <div className="barra-nivel-soccer-points">
            <div
              className="progresso-soccer-points"
              style={{
                width: `${Math.min(
                  (pontos / LIMITE_PONTOS) * 100,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="meta-soccer-points">
            Limite máximo: 5.000 pontos
          </p>

          {pontos >= LIMITE_PONTOS && (
            <p
              style={{
                color: "#00b894",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Você atingiu o limite máximo de
              pontos.
            </p>
          )}

          <button
            className="btn-ganhar-soccer-points"
            onClick={irParaHome}
          >
            Fazer uma compra para ganhar
            pontos
=======
          <h1>Ganhe Pontos, Conquiste Prêmios!</h1>
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
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
          </button>
        </div>
      </section>

      <section className="brindes-soccer-points">
        <h2>Brindes Disponíveis</h2>
<<<<<<< HEAD

        <p className="subtitulo-soccer-points">
          Troque seus pontos por produtos
          exclusivos
        </p>

        <div className="grid-brindes-soccer-points">
          {brindes.map((brinde) => (
            <div
              key={brinde.id}
              className="card-brinde-soccer-points"
            >
              {brinde.tag && (
                <span className="tag-soccer-points">
                  {brinde.tag}
                </span>
              )}

              <img
                src={brinde.imagem}
                alt={brinde.nome}
                className="img-brinde-soccer-points"
              />

              <h3>{brinde.nome}</h3>

              <p className="descricao-brinde-soccer-points">
                Troque por este item exclusivo
              </p>

              <p className="pontos-necessarios-soccer-points">
                <strong>
                  {brinde.custo}
                </strong>{" "}
                pontos
              </p>

              <button
                className="btn-resgatar-soccer-points"
                onClick={() =>
                  resgatarBrinde(brinde)
                }
              >
=======
        <div className="grid-brindes-soccer-points">
          {brindes.map((brinde) => (
            <div key={brinde.id} className="card-brinde-soccer-points">
              {brinde.tag && <span className="tag-soccer-points">{brinde.tag}</span>}
              <img src={brinde.imagem} alt={brinde.nome} className="img-brinde-soccer-points" />
              <h3>{brinde.nome}</h3>
              <p className="pontos-necessarios-soccer-points"><strong>{brinde.custo}</strong> pontos</p>
              <button className="btn-resgatar-soccer-points" onClick={() => resgatarBrinde(brinde)} disabled={loading}>
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
                Trocar Agora
              </button>
            </div>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      <section className="historico-soccer-points">
        <h2>Histórico de Pontos</h2>

        {historico.length === 0 ? (
          <p>
            Nenhuma transação realizada
            ainda.
          </p>
        ) : (
          <ul>
            {historico.map((h, i) => (
              <li
                key={i}
                className={
                  h.tipo === "Ganhos"
                    ? "ganho-soccer-points"
                    : "resgate-soccer-points"
                }
              >
                <span>{h.data}</span> —{" "}
                {h.tipo === "Ganhos"
                  ? `+${h.valor} pontos ganhos`
                  : `${h.item ? h.item + " - " : ""
                  }${h.valor} pontos usados`}
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalAtivo &&
        brindeSelecionado && (
          <div
            className="modal-overlay-soccer-points"
            onClick={fecharModal}
          >
            <div
              className="modal-soccer-points"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <h2>Parabéns!</h2>

              <p>
                Você resgatou{" "}
                <strong>
                  {brindeSelecionado.nome}
                </strong>
              </p>

              <img
                src={brindeSelecionado.imagem}
                alt={
                  brindeSelecionado.nome
                }
                className="img-modal-soccer-points"
              />

              <button
                className="btn-fechar-soccer-points"
                onClick={fecharModal}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
=======
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
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    </main>
  );
}