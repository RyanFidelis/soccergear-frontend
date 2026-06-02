```jsx
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

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://soccergear-backend.onrender.com";

  const LIMITE_PONTOS = 5000;

  const brindes = [
    {
      id: 1,
      nome: "Chaveiro de Futebol",
      custo: 100,
      imagem:
        "https://carrefourbr.vtexassets.com/arquivos/ids/143273602/24130abb7a354a5fb9bbb54b743c0da2.jpg?v=638504454886130000",
      tag: "Popular",
    },
    {
      id: 2,
      nome: "Boné do Time",
      custo: 500,
      imagem:
        "https://th.bing.com/th/id/R.0c1cfa1de4ba155f4c9348f7cabefc82?rik=9Ucxy9QiFwxbzQ&pid=ImgRaw&r=0",
      tag: "Novo",
    },
    {
      id: 3,
      nome: "Camisa Oficial",
      custo: 1000,
      imagem:
        "https://photos.enjoei.com.br/camisa-brasil-22-23-copa-do-mundo/1200xN/czM6Ly9waG90b3MuZW5qb2VpLmNvbS5ici9wcm9kdWN0cy8yNTcxMzQ5Mi83YmMxNjg2ZGJlMTlhN2RiODY2MzFiMmFhMjZjNWViZi5qcGc",
      tag: "Premium",
    },
  ];

  const sincronizarDados = async () => {
    const usuarioLocal = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!usuarioLocal || !usuarioLocal.id) {
      setPontos(0);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/user/${usuarioLocal.id}`
      );

      const data = await response.json();

      if (response.ok) {
        const usuarioAtualizado =
          data.user || data.usuario || data;

        const pontosAtualizados = Math.min(
          usuarioAtualizado.pontos || 0,
          LIMITE_PONTOS
        );

        setPontos(pontosAtualizados);

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({
            ...usuarioLocal,
            ...usuarioAtualizado,
            pontos: pontosAtualizados,
          })
        );
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (usuario?.id) {
      const historicoSalvo = localStorage.getItem(
        `historico-soccer-points-${usuario.id}`
      );

      if (historicoSalvo) {
        setHistorico(JSON.parse(historicoSalvo));
      }
    }

    sincronizarDados();
  }, []);

  useEffect(() => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (usuario?.id) {
      localStorage.setItem(
        `historico-soccer-points-${usuario.id}`,
        JSON.stringify(historico)
      );
    }
  }, [historico]);

  const irParaCompras = () => {
    navigate("/");
  };

  const fecharModal = () => {
    setModalAtivo(false);
  };

  const resgatarBrinde = async (brinde) => {
    if (pontos < brinde.custo) {
      alert("Você não possui pontos suficientes.");
      return;
    }

    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!usuario?.id) {
      alert("Faça login novamente.");
      navigate("/login");
      return;
    }

    const novosPontos = pontos - brinde.custo;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/update/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pontos: novosPontos,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPontos(novosPontos);

        const usuarioAtualizado = {
          ...usuario,
          pontos: novosPontos,
        };

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(usuarioAtualizado)
        );

        window.dispatchEvent(
          new Event("user-updated")
        );

        const novoHistorico = [
          ...historico,
          {
            tipo: "Resgate",
            valor: -brinde.custo,
            data: new Date().toLocaleString("pt-BR"),
            item: brinde.nome,
          },
        ];

        setHistorico(novoHistorico);

        setBrindeSelecionado(brinde);

        setModalAtivo(true);
      } else {
        alert(
          data.message ||
            "Erro ao resgatar brinde."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-soccer-points">
      <section className="hero-soccer-points">
        <div className="caixa-hero-soccer-points">
          <h1>
            Ganhe Pontos, Conquiste Prêmios!
          </h1>

          <p>
            A cada compra aprovada você
            acumula pontos para trocar por
            brindes exclusivos do mundo do
            futebol.
          </p>
        </div>

        <div className="painel-pontos-soccer-points">
          <h2>Seus Pontos</h2>

          <p className="valor-pontos-soccer-points">
            {loading ? "..." : pontos}
          </p>

          <div className="barra-nivel-soccer-points">
            <div
              className="progresso-soccer-points"
              style={{
                width: `${Math.min(
                  (pontos / LIMITE_PONTOS) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="meta-soccer-points">
            Limite máximo: 5000 pontos
          </p>

          {pontos >= LIMITE_PONTOS && (
            <p
              style={{
                color: "#00b894",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Você atingiu o limite máximo
              de pontos.
            </p>
          )}

          <button
            className="btn-ganhar-soccer-points"
            onClick={irParaCompras}
          >
            Ir às Compras
          </button>
        </div>
      </section>

      <section className="brindes-soccer-points">
        <h2>Brindes Disponíveis</h2>

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
                Troque por este item
                exclusivo
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
                disabled={loading}
              >
                {loading
                  ? "Processando..."
                  : "Trocar Agora"}
              </button>
            </div>
          ))}
        </div>
      </section>

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
                  : `${h.item} - ${h.valor} pontos usados`}
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
                Você resgatou:
                <strong>
                  {" "}
                  {brindeSelecionado.nome}
                </strong>
              </p>

              <img
                src={
                  brindeSelecionado.imagem
                }
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
    </main>
  );
}
```
