import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Ofertas.css";

export default function Ofertas() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");
  const [contador, setContador] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  // Produtos em oferta
  const produtosOferta = [
    {
      id: 1,
      nome: "Bola Nike Pitch Futebol",
      imagem: "produtos/bola1.webp",
      descricao:
        "Bola de futebol com design vibrante para melhor visibilidade e controle.",
      precoOriginal: 89.9,
      precoOferta: 71.92,
      desconto: 20,
      categoria: "bolas",
      avaliacao: 4.2,
      numAvaliacoes: 24,
      tamanhos: ["Único"],
    },
    {
      id: 2,
      nome: "Camisa Corinthians 25/26",
      imagem: "produtos/camisa2.jpg",
      descricao: "Nova camisa Corinthians temporada 25/26 - lançamento.",
      precoOriginal: 349.9,
      precoOferta: 279.92,
      desconto: 20,
      categoria: "camisas",
      avaliacao: 4.9,
      numAvaliacoes: 102,
      tamanhos: ["P", "M", "G", "GG"],
    },
    {
      id: 3,
      nome: "Chuteira Nike Mercurial",
      imagem: "produtos/chuteira1.webp",
      descricao: "Chuteira de futsal com solado liso, ideal para quadras indoor.",
      precoOriginal: 349.9,
      precoOferta: 279.92,
      desconto: 20,
      categoria: "chuteiras",
      avaliacao: 4.2,
      numAvaliacoes: 112,
      tamanhos: ["38", "39", "40", "41", "42"],
    },
    {
      id: 4,
      nome: "Luva Poker Altered",
      imagem: "produtos/luva1.webp",
      descricao: "Luva de goleiro profissional com tecnologia de grip avançada.",
      precoOriginal: 349.9,
      precoOferta: 279.92,
      desconto: 20,
      categoria: "luvas",
      avaliacao: 4.7,
      numAvaliacoes: 78,
      tamanhos: ["P", "M", "G"],
    },
  ];

  useEffect(() => {
    setProdutos(produtosOferta);
  }, []);

  // Contador regressivo
  useEffect(() => {
    const atualizarContador = () => {
      const agora = new Date();
      const fimOferta = new Date();
      fimOferta.setDate(agora.getDate() + 3);
      fimOferta.setHours(23, 59, 59, 999);

      const diferenca = fimOferta - agora;
      if (diferenca <= 0) return;

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setContador({ dias, horas, minutos, segundos });
    };

    atualizarContador();
    const intervalo = setInterval(atualizarContador, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const categorias = ["todos", "chuteiras", "luvas", "camisas", "bolas"];

  const produtosFiltrados =
    categoriaSelecionada === "todos"
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaSelecionada);

  // Redireciona para página do produto
  const abrirProduto = (produto) => {
    const produtoFormatado = {
      ...produto,
      preco: produto.precoOferta,
    };
    localStorage.setItem("produtoSelecionado", JSON.stringify(produtoFormatado));
    navigate("/verproduto");
  };

  return (
    <main className="produtos-oferta-container">
      <section className="produtos-oferta-secao">
        <h1 className="produtos-oferta-titulo">Ofertas Especiais</h1>
        <p className="produtos-oferta-subtitulo">
          Aproveite nossos descontos exclusivos por tempo limitado
        </p>

        {/* Contador */}
        <div className="produtos-oferta-contador">
          <h2 className="produtos-oferta-contador-titulo">Oferta termina em:</h2>
          <div className="produtos-oferta-contador-tempo">
            {["dias", "horas", "minutos", "segundos"].map((label) => (
              <div key={label} className="produtos-oferta-contador-item">
                <div className="produtos-oferta-contador-numero">
                  {contador[label].toString().padStart(2, "0")}
                </div>
                <div className="produtos-oferta-contador-label">
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtro de categorias */}
        <div className="produtos-oferta-filtros">
          {categorias.map((cat) => (
            <button
              key={cat}
              className={`filtro-btn-oferta ${
                categoriaSelecionada === cat ? "ativo" : ""
              }`}
              onClick={() => setCategoriaSelecionada(cat)}
            >
              {cat === "todos"
                ? "Todos os Produtos"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de produtos */}
        <div className="produtos-oferta-grid">
          {produtosFiltrados.length === 0 ? (
            <div className="sem-produtos">
              <h3>Nenhum produto encontrado</h3>
              <p>Tente selecionar outra categoria</p>
            </div>
          ) : (
            produtosFiltrados.map((produto) => (
              <div
                key={produto.id}
                className="produto-card-oferta"
                onClick={() => abrirProduto(produto)}
              >
                <div className="produto-badge-oferta">-{produto.desconto}%</div>

                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="produto-imagem-oferta"
                />

                <div className="produto-info-oferta">
                  <div className="produto-categoria-oferta">
                    {produto.categoria}
                  </div>
                  <h3 className="produto-nome-oferta">{produto.nome}</h3>
                  <p className="produto-descricao-oferta">
                    {produto.descricao}
                  </p>

                  <div className="produto-avaliacao-oferta">
                    <div className="estrelas-oferta">
                      {"★".repeat(Math.round(produto.avaliacao))}
                      {"☆".repeat(5 - Math.round(produto.avaliacao))}
                    </div>
                    <span className="avaliacao-texto-oferta">
                      {produto.avaliacao} ({produto.numAvaliacoes})
                    </span>
                  </div>

                  <div className="produto-precos-oferta">
                    <span className="produto-preco-original-oferta">
                      R$ {produto.precoOriginal.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="produto-preco-oferta">
                      R$ {produto.precoOferta.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
