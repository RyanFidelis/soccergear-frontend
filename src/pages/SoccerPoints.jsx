import React, { useState, useEffect } from "react";
import "../css/SoccerPoints.css";

export default function SoccerPoints() {
  const [pontos, setPontos] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [modalAtivo, setModalAtivo] = useState(false);
  const [brindeSelecionado, setBrindeSelecionado] = useState(null);

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

  useEffect(() => {
    const pontosSalvos = localStorage.getItem("pontos-soccer-points");
    const historicoSalvo = localStorage.getItem("historico-soccer-points");
    if (pontosSalvos) setPontos(Number(pontosSalvos));
    if (historicoSalvo) setHistorico(JSON.parse(historicoSalvo));
  }, []);

  useEffect(() => {
    localStorage.setItem("pontos-soccer-points", pontos);
    localStorage.setItem("historico-soccer-points", JSON.stringify(historico));
  }, [pontos, historico]);

  const adicionarPontos = (valor) => {
    setPontos(pontos + valor);
    setHistorico([
      ...historico,
      { tipo: "Ganhos", valor, data: new Date().toLocaleString() },
    ]);
  };

  const resgatarBrinde = (brinde) => {
    if (pontos >= brinde.custo) {
      setPontos(pontos - brinde.custo);
      setHistorico([
        ...historico,
        {
          tipo: "Resgate",
          valor: -brinde.custo,
          data: new Date().toLocaleString(),
          item: brinde.nome,
        },
      ]);
      setBrindeSelecionado(brinde);
      setModalAtivo(true);
    } else {
      alert("Você não tem pontos suficientes para este brinde!");
    }
  };

  const fecharModal = () => setModalAtivo(false);

  return (
    <main className="container-soccer-points">
      {/* Header */}
      <section className="hero-soccer-points">
        <div className="caixa-hero-soccer-points">
          <h1>Ganhe Pontos, Conquiste Prêmios!</h1>
          <p>
            A cada compra você acumula pontos para trocar por brindes exclusivos
            do mundo do futebol!
          </p>
        </div>

        <div className="painel-pontos-soccer-points">
          <h2>Seus Pontos</h2>
          <p className="valor-pontos-soccer-points">{pontos}</p>
          <div className="barra-nivel-soccer-points">
            <div
              className="progresso-soccer-points"
              style={{
                width: `${Math.min((pontos / 500) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="meta-soccer-points">Próximo nível: 500 pontos</p>
          <button
            className="btn-ganhar-soccer-points"
            onClick={() => adicionarPontos(50)}
          >
            Fazer uma compra (+50 pontos)
          </button>
        </div>
      </section>

      {/* Brindes */}
      <section className="brindes-soccer-points">
        <h2>Brindes Disponíveis</h2>
        <p className="subtitulo-soccer-points">
          Troque seus pontos por produtos exclusivos
        </p>
        <div className="grid-brindes-soccer-points">
          {brindes.map((brinde) => (
            <div key={brinde.id} className="card-brinde-soccer-points">
              {brinde.tag && (
                <span className="tag-soccer-points">{brinde.tag}</span>
              )}
              <img
                src={brinde.imagem}
                alt={brinde.nome}
                className="img-brinde-soccer-points"
              />
              <h3>{brinde.nome}</h3>
              <p className="descricao-brinde-soccer-points">
                Troque por este item exclusivo!
              </p>
              <p className="pontos-necessarios-soccer-points">
                <strong>{brinde.custo}</strong> pontos
              </p>
              <button
                className="btn-resgatar-soccer-points"
                onClick={() => resgatarBrinde(brinde)}
              >
                Trocar Agora
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Histórico */}
      <section className="historico-soccer-points">
        <h2>Histórico de Pontos</h2>
        {historico.length === 0 ? (
          <p>Nenhuma transação realizada ainda.</p>
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
                  : `${h.item ? h.item + " - " : ""}${h.valor} pontos usados`}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal */}
      {modalAtivo && brindeSelecionado && (
        <div className="modal-overlay-soccer-points" onClick={fecharModal}>
          <div
            className="modal-soccer-points"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>🎁 Parabéns!</h2>
            <p>
              Você resgatou: <strong>{brindeSelecionado.nome}</strong>
            </p>
            <img
              src={brindeSelecionado.imagem}
              alt={brindeSelecionado.nome}
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
