import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const categorias = [
    { nome: "chuteiras", titulo: "Chuteiras" },
    { nome: "luvas", titulo: "Luvas" },
    { nome: "camisas", titulo: "Camisas" },
    { nome: "caneleiras", titulo: "Caneleiras" },
    { nome: "meioes", titulo: "Meiões" },
    { nome: "bolas", titulo: "Bolas" },
  ];

  // =========================
  // STATES
  // =========================

  const [produtos, setProdutos] = useState({});
  const [favoritos, setFavoritos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscou, setBuscou] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [modalCompra, setModalCompra] = useState({
    aberto: false,
    produto: null,
    uid: null,
  });

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");

  const refsCategorias = useRef({});
  const intervalRef = useRef(null);

  // =========================
  // BANNERS
  // =========================

  const originalBanners = [
    {
      id: 1,
      img: "/imagem/anuncio.webp",
      titulo: "Nike Phantom",
    },
    {
      id: 2,
      img: "/imagem/anuncio2.jpg",
      titulo: "Camisa do Corinthians 25/26",
    },
    {
      id: 3,
      img: "/imagem/anuncio3.avif",
      titulo: "Nike Zoom Mercurial Vapor 16 Elite KM",
    },
  ];

  const banners = [
    originalBanners[originalBanners.length - 1],
    ...originalBanners,
    originalBanners[0],
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const realIndex =
    (currentIndex - 1 + originalBanners.length) %
    originalBanners.length;

  // =========================
  // STORAGE
  // =========================

  const getStorageKey = (prefix) => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    return usuario && usuario.id
      ? `${prefix}_${usuario.id}`
      : `${prefix}_guest`;
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    const favKey = getStorageKey("favoritos");
    const cartKey = getStorageKey("cart");

    const favoritosSalvos =
      JSON.parse(localStorage.getItem(favKey)) || [];

    const carrinhoSalvo =
      JSON.parse(localStorage.getItem(cartKey)) || [];

    setFavoritos(favoritosSalvos);
    setCarrinho(carrinhoSalvo);

    async function carregarProdutos() {
      const dados = {};

      for (const { nome } of categorias) {
        try {
          const res = await fetch(`/json/${nome}.json`);
          const json = await res.json();

          dados[nome] = json;
        } catch (error) {
          console.error(`Erro ao carregar ${nome}:`, error);
        }
      }

      setProdutos(dados);
    }

    carregarProdutos();
  }, []);

  // =========================
  // SALVAR FAVORITOS
  // =========================

  useEffect(() => {
    const favKey = getStorageKey("favoritos");

    localStorage.setItem(
      favKey,
      JSON.stringify(favoritos)
    );
  }, [favoritos]);

  // =========================
  // SALVAR CARRINHO
  // =========================

  useEffect(() => {
    const cartKey = getStorageKey("cart");

    localStorage.setItem(
      cartKey,
      JSON.stringify(carrinho)
    );
  }, [carrinho]);

  // =========================
  // CARROSSEL
  // =========================

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  const nextSlide = () => {
    if (currentIndex >= banners.length - 1) return;

    setIsTransitioning(true);

    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex <= 0) return;

    setIsTransitioning(true);

    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (currentIndex === banners.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }

    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(banners.length - 2);
    }
  };

  // =========================
  // FEEDBACK
  // =========================

  const mostrarFeedback = (msg) => {
    setFeedbackMsg(msg);

    setTimeout(() => {
      setFeedbackMsg("");
    }, 2000);
  };

  // =========================
  // FAVORITOS
  // =========================

  const toggleFavorito = (produtoComUID, uid) => {
    setFavoritos((prev) => {
      const existe = prev.find((f) => f.uid === uid);

      if (existe) {
        mostrarFeedback("Removido dos favoritos");

        return prev.filter((f) => f.uid !== uid);
      } else {
        mostrarFeedback("Adicionado aos favoritos");

        return [...prev, produtoComUID];
      }
    });
  };

  // =========================
  // MODAL CARRINHO
  // =========================

  const abrirModalCompra = (produto, uid) => {
    const temEstoque =
      produto.estoque &&
      Object.keys(produto.estoque).length > 0;

    if (!temEstoque) {
      adicionarAoCarrinhoFinal(produto, uid, "Único");
    } else {
      setModalCompra({
        aberto: true,
        produto,
        uid,
      });

      setTamanhoSelecionado("");
    }
  };

  const fecharModalCompra = () => {
    setModalCompra({
      aberto: false,
      produto: null,
      uid: null,
    });

    setTamanhoSelecionado("");
  };

  const confirmarAdicaoAoCarrinho = () => {
    if (!tamanhoSelecionado) {
      alert("Selecione um tamanho.");

      return;
    }

    const { produto, uid } = modalCompra;

    adicionarAoCarrinhoFinal(
      produto,
      uid,
      tamanhoSelecionado
    );

    fecharModalCompra();
  };

  // =========================
  // ADICIONAR CARRINHO
  // =========================

  const adicionarAoCarrinhoFinal = (
    produto,
    uid,
    tamanhoEscolhido
  ) => {
    const item = {
      id: produto.id,
      uid,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: produto.preco,
      tamanho: tamanhoEscolhido,
      quantity: 1,
    };

    setCarrinho((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.id === item.id &&
          p.tamanho === item.tamanho
      );

      if (idx >= 0) {
        const atualizado = [...prev];

        atualizado[idx].quantity += 1;

        return atualizado;
      }

      return [...prev, item];
    });

    window.dispatchEvent(
      new CustomEvent("cart-updated")
    );

    mostrarFeedback(
      `${produto.nome} adicionado ao carrinho`
    );
  };

  // =========================
  // BUSCA
  // =========================

  const buscarProdutos = () => {
    const termo = termoBusca.trim().toLowerCase();

    setBuscou(true);

    if (termo === "") {
      setResultados([]);

      return;
    }

    const todos = Object.entries(produtos).flatMap(
      ([categoria, lista]) =>
        lista.map((p) => ({
          ...p,
          categoria,
        }))
    );

    const filtrados = todos.filter((p) => {
      const nome = p.nome.toLowerCase();

      const descricao = (
        p.descricao || ""
      ).toLowerCase();

      return (
        nome.includes(termo) ||
        descricao.includes(termo)
      );
    });

    setResultados(filtrados);
  };

  const voltarParaHome = () => {
    setResultados([]);
    setBuscou(false);
    setTermoBusca("");
  };

  // =========================
  // SCROLL
  // =========================

  const scrollCategoria = (nome, direcao) => {
    const ref = refsCategorias.current[nome];

    if (ref && ref.scrollBy) {
      const distancia = ref.clientWidth * 0.6;

      ref.scrollBy({
        left:
          direcao === "direita"
            ? distancia
            : -distancia,
        behavior: "smooth",
      });
    }
  };

  // =========================
  // RENDER PRODUTO
  // =========================

  const renderProduto = (produto, categoria) => {
    const uid = `${categoria}-${produto.id}`;

    const favorito = favoritos.some(
      (f) => f.uid === uid
    );

    const produtoComUID = {
      ...produto,
      uid,
    };

    const irParaDetalhes = () => {
      localStorage.setItem(
        "produtoSelecionado",
        JSON.stringify(produtoComUID)
      );

      navigate("/verproduto");
    };

    return (
      <div className="produto" key={uid}>
        <div
          className="produto-clicavel"
          onClick={irParaDetalhes}
        >
          <div className="produto-imagem">
            <img
              src={produto.imagem}
              alt={produto.nome}
              onError={(e) =>
                (e.target.src =
                  "/imagem/placeholder.png")
              }
            />
          </div>

          <div className="produto-info">
            <h4>{produto.nome}</h4>

            <p className="descricao">
              {produto.descricao}
            </p>

            <p className="preco">
              R${" "}
              {produto.preco
                .toFixed(2)
                .replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="produto-acoes-card">
          <button
            className={`btn-acao-card btn-fav ${
              favorito ? "ativo" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();

              toggleFavorito(
                produtoComUID,
                uid
              );
            }}
          >
            {favorito ? "⭐" : "☆"}
          </button>

          <button
            className="btn-acao-card btn-cart"
            onClick={(e) => {
              e.stopPropagation();

              abrirModalCompra(produto, uid);
            }}
          >
            <img
              src="/imagem/carrinho.png"
              alt="Carrinho"
              className="icon carrinho"
            />
          </button>
        </div>
      </div>
    );
  };

  // =========================
  // JSX
  // =========================

  return (
    <main style={{ position: "relative" }}>
      <div
        className={`feedback-toast ${
          feedbackMsg ? "show" : ""
        }`}
      >
        {feedbackMsg}
      </div>

      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={termoBusca}
          onChange={(e) =>
            setTermoBusca(e.target.value)
          }
        />

        <button onClick={buscarProdutos}>
          Buscar
        </button>

        {buscou && (
          <button
            className="btn-voltar"
            onClick={voltarParaHome}
          >
            Voltar
          </button>
        )}
      </div>

      {!buscou && (
        <>
          <h2 className="titulo">
            Destaques da Semana
          </h2>

          <div className="carrossel-container">
            <button
              className="carrossel-btn prev"
              onClick={prevSlide}
            >
              &#10094;
            </button>

            <div
              className="carrossel-track"
              onTransitionEnd={
                handleTransitionEnd
              }
              style={{
                transform: `translateX(-${
                  currentIndex * 100
                }%)`,
                transition: isTransitioning
                  ? "transform 0.8s ease-in-out"
                  : "none",
              }}
            >
              {banners.map((banner, idx) => (
                <div
                  className="carrossel-slide"
                  key={idx}
                >
                  <img
                    src={banner.img}
                    alt={banner.titulo}
                  />

                  <div className="carrossel-legenda">
                    <p>{banner.titulo}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="carrossel-btn next"
              onClick={nextSlide}
            >
              &#10095;
            </button>

            <div className="carrossel-dots">
              {originalBanners.map(
                (_, index) => (
                  <span
                    key={index}
                    className={`dot ${
                      realIndex === index
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setIsTransitioning(true);

                      setCurrentIndex(
                        index + 1
                      );
                    }}
                  ></span>
                )
              )}
            </div>
          </div>
        </>
      )}

      {buscou && resultados.length > 0 && (
        <>
          <h2 className="titulo">
            Resultados da busca
          </h2>

          <div className="grid-produtos">
            {resultados.map((p) =>
              renderProduto(p, p.categoria)
            )}
          </div>
        </>
      )}

      {buscou && resultados.length === 0 && (
        <p className="nenhum-produto">
          Nenhum produto encontrado para "
          {termoBusca}"
        </p>
      )}

      {!buscou && (
        <>
          <h2 className="titulo">Produtos</h2>

          {categorias.map(
            ({ nome, titulo }) => (
              <section
                className="categoria"
                key={nome}
              >
                <h3>{titulo}</h3>

                <button
                  className="seta esquerda"
                  onClick={() =>
                    scrollCategoria(
                      nome,
                      "esquerda"
                    )
                  }
                >
                  &#10094;
                </button>

                <div
                  className="produtos"
                  ref={(el) =>
                    (refsCategorias.current[
                      nome
                    ] = el)
                  }
                >
                  {produtos[nome]?.map((p) =>
                    renderProduto(p, nome)
                  )}
                </div>

                <button
                  className="seta direita"
                  onClick={() =>
                    scrollCategoria(
                      nome,
                      "direita"
                    )
                  }
                >
                  &#10095;
                </button>
              </section>
            )
          )}
        </>
      )}

      {modalCompra.aberto &&
        modalCompra.produto && (
          <div className="modal-overlay-tamanho">
            <div className="modal-content-tamanho">
              <h3>Selecione o tamanho</h3>

              <p className="modal-produto-nome">
                {modalCompra.produto.nome}
              </p>

              <div className="grid-tamanhos">
                {Object.keys(
                  modalCompra.produto
                    .estoque || {}
                ).map((tam) => {
                  const qtd =
                    modalCompra.produto
                      .estoque[tam];

                  const esgotado =
                    qtd <= 0;

                  return (
                    <button
                      key={tam}
                      disabled={esgotado}
                      className={`btn-tamanho ${
                        tamanhoSelecionado ===
                        tam
                          ? "selecionado"
                          : ""
                      } ${
                        esgotado
                          ? "esgotado"
                          : ""
                      }`}
                      onClick={() =>
                        setTamanhoSelecionado(
                          tam
                        )
                      }
                    >
                      {tam}
                    </button>
                  );
                })}
              </div>

              <div className="modal-acoes">
                <button
                  className="btn-cancelar-modal"
                  onClick={
                    fecharModalCompra
                  }
                >
                  Cancelar
                </button>

                <button
                  className="btn-confirmar-modal"
                  onClick={
                    confirmarAdicaoAoCarrinho
                  }
                  disabled={
                    !tamanhoSelecionado
                  }
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
