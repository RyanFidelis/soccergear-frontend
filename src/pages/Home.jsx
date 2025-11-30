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

  const getStorageKey = (prefix) => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    return usuario && usuario.id ? `${prefix}_${usuario.id}` : `${prefix}_guest`;
  };

  const [produtos, setProdutos] = useState({});
  const [favoritos, setFavoritos] = useState([]);
  const [favoritosCarregados, setFavoritosCarregados] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscou, setBuscou] = useState(false);

  const refsCategorias = useRef({});

  const mostrarFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 2000);
  };

  const adicionarRapidoAoCarrinho = (produto, uid) => {
    const estoqueDisp = produto.estoque ? (produto.estoque['Único'] || Object.values(produto.estoque)[0] || 0) : 1;
    if (Number(estoqueDisp) <= 0) {
        mostrarFeedback("Produto esgotado!");
        return;
    }

    const key = getStorageKey("cart");
    const raw = localStorage.getItem(key);
    let carrinho = raw ? JSON.parse(raw) : [];

    const itemToAdd = {
      id: produto.id,
      uid: uid,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: produto.preco,
      tamanho: "Único",
      quantity: 1,
    };

    const idx = carrinho.findIndex(
      (it) => it.id === itemToAdd.id && it.tamanho === itemToAdd.tamanho
    );

    if (idx >= 0) carrinho[idx].quantity++;
    else carrinho.push(itemToAdd);

    localStorage.setItem(key, JSON.stringify(carrinho));
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: carrinho }));
    mostrarFeedback(`${produto.nome} adicionado!`);
  };

  useEffect(() => {
    const favKey = getStorageKey("favoritos");
    const salvos = JSON.parse(localStorage.getItem(favKey)) || [];
    setFavoritos(salvos);
    setFavoritosCarregados(true);

    async function carregar() {
      const dados = {};
      for (const { nome } of categorias) {
        try {
          const res = await fetch(`/json/${nome}.json`);
          const json = await res.json();
          dados[nome] = json;
        } catch (e) {
          console.error(`Erro ao carregar ${nome}:`, e);
        }
      }
      setProdutos(dados);
    }
    carregar();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (favoritosCarregados) {
      const favKey = getStorageKey("favoritos");
      localStorage.setItem(favKey, JSON.stringify(favoritos));
    }
  }, [favoritos, favoritosCarregados]);

  const buscarProdutos = () => {
    const termo = termoBusca.trim().toLowerCase();
    setBuscou(true);

    if (termo === "") {
      setResultados([]);
      return;
    }

    const todos = Object.entries(produtos).flatMap(([categoria, lista]) =>
      lista.map((p) => ({ ...p, categoria }))
    );

    const filtrados = todos.filter((p) => {
      const nome = p.nome.toLowerCase();
      const descricao = (p.descricao || "").toLowerCase();

      return (
        nome.includes(termo) ||
        descricao.includes(termo) ||
        similaridade(nome, termo) >= 0.5
      );
    });

    setResultados(filtrados);
  };

  function similaridade(a, b) {
    if (!a || !b) return 0;
    a = a.toLowerCase();
    b = b.toLowerCase();

    let matches = 0;
    for (let i = 0; i < a.length; i++) {
      if (b.includes(a[i])) matches++;
    }
    return matches / Math.max(a.length, b.length);
  }

  const voltarParaHome = () => {
    setResultados([]);
    setBuscou(false);
    setTermoBusca("");
  };

  const renderProduto = (produto, categoria) => {
    const uid = `${categoria}-${produto.id}`;
    const favorito = favoritos.some((f) => f.uid === uid);
    const produtoComUID = { ...produto, uid };

    const irParaDetalhes = () => {
        localStorage.setItem("produtoSelecionado", JSON.stringify(produtoComUID));
        navigate("/verproduto");
    };

    return (
      <div className="produto" key={uid}>
        <div className="produto-clicavel" onClick={irParaDetalhes}>
            <div className="produto-imagem">
            <img
                src={produto.imagem}
                alt={produto.nome}
                onError={(e) => (e.target.src = "/imagem/placeholder.png")}
            />
            </div>

            <div className="produto-info">
            <h4>{produto.nome}</h4>
            <p className="preco">
                R$ {produto.preco.toFixed(2).replace(".", ",")}
            </p>
            </div>
        </div>

        <div className="produto-acoes-card">
            <button 
                className={`btn-acao-card btn-fav ${favorito ? 'ativo' : ''}`}
                title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                onClick={(e) => {
                    e.stopPropagation(); 
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
                }}
            >
                {favorito ? "⭐" : "☆"}
            </button>

            <button 
                className="btn-acao-card btn-cart"
                title="Adicionar ao carrinho"
                onClick={(e) => {
                    e.stopPropagation();
                    adicionarRapidoAoCarrinho(produto, uid);
                }}
            >
                <img src="imagem/carrinho.png" alt="Carrinho" className="icon carrinho" />
            </button>
        </div>
      </div>
    );
  };

  const scrollCategoria = (nome, direcao) => {
    const ref = refsCategorias.current[nome];
    if (ref && ref.scrollBy) {
      const distancia = ref.clientWidth * 0.6;
      ref.scrollBy({
        left: direcao === "direita" ? distancia : -distancia,
        behavior: "smooth",
      });
    }
  };

  return (
    <main style={{ position: 'relative' }}>
      <div className={`feedback-toast ${feedbackMsg ? 'show' : ''}`}>
        {feedbackMsg}
      </div>

      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Buscar produtos pelo nome..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
        <button onClick={buscarProdutos}>Buscar</button>

        {buscou && (
          <button
            style={{
              marginLeft: "10px",
              backgroundColor: "#444",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={voltarParaHome}
          >
            Voltar
          </button>
        )}
      </div>

      {!buscou && (
        <>
          <h2 className="titulo">Lançamento</h2>
          <div className="anuncio">
            <img src="/imagem/anuncio.jpg" alt="Anúncio" />
            <p>Nike React Gato - Futsal</p>
          </div>
          <hr />
        </>
      )}

      {buscou && resultados.length > 0 && (
        <>
          <h2 className="titulo">Resultados da busca</h2>
          <div className="ResultadosProdutos grid-produtos">
            {resultados.map((p) => renderProduto(p, p.categoria))}
          </div>
        </>
      )}

      {buscou && resultados.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "2rem", color: "#555" }}>
          Nenhum produto encontrado para "{termoBusca}".
        </p>
      )}

      {!buscou && (
        <>
          <h2 className="titulo">Produtos</h2>
          {categorias.map(({ nome, titulo }) => (
            <section className="categoria" key={nome}>
              <h3>{titulo}</h3>

              <button
                className="seta esquerda"
                onClick={() => scrollCategoria(nome, "esquerda")}
              >
                &#10094;
              </button>

              <div
                className="produtos"
                ref={(el) => (refsCategorias.current[nome] = el)}
              >
                {produtos[nome]?.map((p) => renderProduto(p, nome))}
              </div>

              <button
                className="seta direita"
                onClick={() => scrollCategoria(nome, "direita")}
              >
                &#10095;
              </button>
            </section>
          ))}
        </>
      )}
    </main>
  );
}