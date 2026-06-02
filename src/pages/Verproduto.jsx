import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Verproduto.css";

export default function VerProduto() {
  const navigate = useNavigate();

  const [produto, setProduto] = useState(null);
  const [variacoes, setVariacoes] = useState([]);
  const [imagemPrincipal, setImagemPrincipal] = useState("");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");
  const [miniaturas, setMiniaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [estoquePorTamanho, setEstoquePorTamanho] = useState({});
  const [mensagemFeedback, setMensagemFeedback] = useState("");
  const [cep, setCep] = useState("");
  const [freteInfo, setFreteInfo] = useState(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const getCartKey = () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    return usuario && usuario.id
      ? `cart_${usuario.id}`
      : "cart_guest";
  };

  function lerEstoqueLocal(prodId) {
    try {
      const raw = localStorage.getItem("estoqueAtual");

      if (!raw) return null;

      const obj = JSON.parse(raw);

      return obj[prodId] || null;
    } catch {
      return null;
    }
  }

  function gravarEstoqueLocal(prodId, novoMapa) {
    try {
      const raw = localStorage.getItem("estoqueAtual");

      const obj = raw ? JSON.parse(raw) : {};

      obj[prodId] = novoMapa;

      localStorage.setItem(
        "estoqueAtual",
        JSON.stringify(obj)
      );
    } catch (e) {
      console.error("Erro ao salvar estoque:", e);
    }
  }

  useEffect(() => {
    const produtoSelecionado = JSON.parse(
      localStorage.getItem("produtoSelecionado")
    );

    const usuarioLogado = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!produtoSelecionado) {
      navigate("/");
      return;
    }

    let tamanhosDefinidos =
      produtoSelecionado.tamanhos || [];

    if (produtoSelecionado.categoria === "luvas") {
      tamanhosDefinidos = ["9", "10", "11", "12"];
    } else if (
      ["bolas", "caneleiras", "meioes"].includes(
        produtoSelecionado.categoria
      )
    ) {
      tamanhosDefinidos = [];
    }

    const prod = {
      ...produtoSelecionado,
      tamanhos: tamanhosDefinidos,
    };

    setProduto(prod);

    setImagemPrincipal(produtoSelecionado.imagem || "");

    const imagens = [
      produtoSelecionado.imagem,
      ...(produtoSelecionado.angulo || []).filter(
        (img) => img && img !== produtoSelecionado.imagem
      ),
    ];

    setMiniaturas(imagens);

    const estoqueLocal = lerEstoqueLocal(prod.id);

    if (estoqueLocal) {
      setEstoquePorTamanho(estoqueLocal);
    } else {
      setEstoquePorTamanho(
        prod.estoque ? { ...prod.estoque } : {}
      );
    }

    if (usuarioLogado && usuarioLogado.endereco) {
      setCep(usuarioLogado.endereco);
    }

    carregarVariacoes(produtoSelecionado);

    setCarregando(false);
  }, [navigate]);

  async function carregarVariacoes(produtoBase) {
    const arquivos = [
      "chuteiras",
      "bolas",
      "meioes",
      "luvas",
      "camisas",
      "caneleiras",
    ];

    try {
      const promises = arquivos.map(async (nome) => {
        const res = await fetch(`/json/${nome}.json`);

        return res.ok ? await res.json() : [];
      });

      const todos = (await Promise.all(promises)).flat();

      const filtradas = todos.filter(
        (p) =>
          p.nome === produtoBase.nome &&
          p.id !== produtoBase.id
      );

      setVariacoes(filtradas);
    } catch (error) {
      console.log("Erro ao carregar variações:", error);
    }
  }

  function mostrarFeedback(msg) {
    setMensagemFeedback(msg);

    const el = document.querySelector(".feedback-message");

    if (el) {
      el.classList.add("show");

      setTimeout(() => {
        el.classList.remove("show");
      }, 1500);
    }
  }

  function renderEstrelas(nota) {
    if (!nota && nota !== 0) return null;

    const full = Math.floor(nota);

    const meio = nota - full >= 0.5;

    const vazias = 5 - full - (meio ? 1 : 0);

    return (
      <>
        {"★".repeat(full)}
        {meio ? "⯪" : ""}
        {"☆".repeat(vazias)}
      </>
    );
  }

  function selecionarTamanho(t) {
    setTamanhoSelecionado(String(t));
  }

  function adicionarAoCarrinho() {
    if (
      produto.tamanhos?.length > 0 &&
      !tamanhoSelecionado
    ) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

    const key = getCartKey();

    const raw = localStorage.getItem(key);

    let carrinho = raw ? JSON.parse(raw) : [];

    const item = {
      id: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: produto.preco,
      tamanho: tamanhoSelecionado || "Único",
      quantity: 1,
    };

    const idx = carrinho.findIndex(
      (it) =>
        it.id === item.id &&
        it.tamanho === item.tamanho
    );

    if (idx >= 0) {
      carrinho[idx].quantity++;
    } else {
      carrinho.push(item);
    }

    localStorage.setItem(
      key,
      JSON.stringify(carrinho)
    );

    mostrarFeedback(
      `${produto.nome} adicionado ao carrinho!`
    );
  }

  async function calcularFrete() {
    const cepLimpo = cep.replace(/\D/g, "");

    if (!cepLimpo || cepLimpo.length !== 8) {
      alert("CEP inválido.");
      return;
    }

    setLoadingFrete(true);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      let valor = 0;
      let prazo = "";

      if (
        data.localidade === "Santana de Parnaíba" &&
        data.uf === "SP"
      ) {
        valor = 5;
        prazo = "1 dia útil";
      } else if (data.uf === "SP") {
        valor = 10;
        prazo = "2 a 4 dias úteis";
      } else {
        valor = 50;
        prazo = "5 a 10 dias úteis";
      }

      setFreteInfo({
        valor: valor.toFixed(2).replace(".", ","),
        prazo,
        cidade: data.localidade,
        uf: data.uf,
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao calcular frete.");
    } finally {
      setLoadingFrete(false);
    }
  }

  if (carregando || !produto) {
    return (
      <main
        className="produto-detalhe"
        style={{
          textAlign: "center",
          padding: 40,
        }}
      >
        Carregando produto...
      </main>
    );
  }

  return (
    <main className="produto-detalhe">
      <div className="imagem-produto">
        <img
          src={imagemPrincipal}
          alt={produto.nome}
          className="imagem-principal"
        />

        <div className="miniaturas">
          {miniaturas.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Miniatura ${i}`}
              className={
                img === imagemPrincipal
                  ? "miniatura ativo"
                  : "miniatura"
              }
              onClick={() =>
                setImagemPrincipal(img)
              }
            />
          ))}
        </div>
      </div>

      <div className="info-produto">
        <h1>{produto.nome}</h1>

        <div className="avaliacao-produto">
          {renderEstrelas(produto.avaliacao)}
        </div>

        <p>{produto.descricao}</p>

        <p className="preco">
          R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
        </p>

        {produto.tamanhos?.length > 0 && (
          <>
            <label>Tamanho</label>

            <div className="tamanhos-opcoes">
              {produto.tamanhos.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    tamanhoSelecionado === String(t)
                      ? "tamanho-bolinha ativo"
                      : "tamanho-bolinha"
                  }
                  onClick={() =>
                    selecionarTamanho(t)
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="botoes-compra">
          <button
            className="btn-carrinho"
            onClick={adicionarAoCarrinho}
          >
            Adicionar ao Carrinho
          </button>
        </div>

        <div className="container-frete">
          <label>Calcular Frete</label>

          <div className="input-frete-wrapper">
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              maxLength="9"
              onChange={(e) =>
                setCep(e.target.value)
              }
            />

            <button
              onClick={calcularFrete}
              disabled={loadingFrete}
            >
              {loadingFrete ? "..." : "OK"}
            </button>
          </div>

          {freteInfo && (
            <div className="resultado-frete">
              <p>
                Entregar em{" "}
                <strong>
                  {freteInfo.cidade} - {freteInfo.uf}
                </strong>
              </p>

              <p>
                Frete: R$ {freteInfo.valor}
              </p>

              <p>
                Prazo: {freteInfo.prazo}
              </p>
            </div>
          )}
        </div>

        <div className="feedback-message">
          {mensagemFeedback}
        </div>
      </div>
    </main>
  );
}

