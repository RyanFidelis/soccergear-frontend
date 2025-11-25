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

  const [produtos, setProdutos] = useState({});
  const [favoritos, setFavoritos] = useState(
    JSON.parse(localStorage.getItem("favoritos")) || []
  );
  const [carrinho, setCarrinho] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscou, setBuscou] = useState(false); 

  const refsCategorias = useRef({});

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(carrinho));
  }, [carrinho]);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  // 🔍 Busca acionada apenas ao clicar no botão
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

    // Busca fuzzy (termos parecidos)
    const filtrados = todos.filter((p) => {
      const nome = p.nome.toLowerCase();
      const descricao = (p.descricao || "").toLowerCase();

      // Aceita correspondências parciais, parecidas ou dentro do nome
      return (
        nome.includes(termo) ||
        descricao.includes(termo) ||
        similaridade(nome, termo) >= 0.5
      );
    });

    setResultados(filtrados);
  };

  // 🧠 Função de similaridade simples (Levenshtein simplificado)
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

  // 🔙 Voltar para Home normal
  const voltarParaHome = () => {
    setResultados([]);
    setBuscou(false);
    setTermoBusca("");
  };

  const renderProduto = (produto, categoria) => {
    const uid = `${categoria}-${produto.id}`;
    const favorito = favoritos.some((f) => f.uid === uid);
    const produtoComUID = { ...produto, uid };

    return (
      <div
        className="produto"
        key={uid}
        onClick={() => {
          localStorage.setItem(
            "produtoSelecionado",
            JSON.stringify(produtoComUID)
          );
          navigate("/verproduto");
        }}
      >
        <div className="produto-imagem">
          <img
            src={produto.imagem}
            alt={produto.nome}
            onError={(e) => (e.target.src = "/imagem/placeholder.png")}
          />
        </div>

        <div className="produto-info">
          <h4>{produto.nome}</h4>
          <p className="descricao">{produto.descricao}</p>
          <p className="preco">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>

          <span
            className="estrela-favorito"
            onClick={(e) => {
              e.stopPropagation();
              setFavoritos((prev) => {
                const existe = prev.find((f) => f.uid === uid);
                return existe
                  ? prev.filter((f) => f.uid !== uid)
                  : [...prev, produtoComUID];
              });
            }}
          >
            {favorito ? "⭐" : "☆"}
          </span>
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
    <main>
      {/* 🔍 Barra de pesquisa */}
      <div className="barra-pesquisa">
        <input
          type="text"
          placeholder="Buscar produtos pelo nome..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
        <button onClick={buscarProdutos}>Buscar</button>

        {/* 🔙 Botão para voltar à Home (só aparece após buscar) */}
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

      {/* 🔹 Exibe o lançamento apenas se não estiver buscando */}
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

      {/* 🔹 Resultados da busca */}
      {buscou && resultados.length > 0 && (
        <>
          <h2 className="titulo">Resultados da busca</h2>
          <div className="ResultadosProdutos grid-produtos">
            {resultados.map((p) => renderProduto(p, p.categoria))}
          </div>
        </>
      )}

      {/* 🔹 Se buscou e não encontrou nada */}
      {buscou && resultados.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "2rem", color: "#555" }}>
          Nenhum produto encontrado para "{termoBusca}". 
        </p>
      )}

      {/* 🔹 Se não buscou, mostra categorias */}
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
