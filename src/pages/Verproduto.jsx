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

  // 🔹 Função auxiliar para pegar a chave correta do carrinho
  const getCartKey = () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    return usuario && usuario.id ? `cart_${usuario.id}` : "cart_guest";
  };

  // --- util: ler/atualizar estoque armazenado localmente (por produto id)
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
      localStorage.setItem("estoqueAtual", JSON.stringify(obj));
    } catch (e) {
      console.error("Erro ao salvar estoqueLocal", e);
    }
  }

  // decrementa estoque local (delta negativo para reduzir)
  function atualizarEstoque(prodId, tamanho, delta) {
    const atual = lerEstoqueLocal(prodId) || { ...produto.estoque };
    const atualQtd = Number(atual[tamanho] ?? produto.estoque?.[tamanho] ?? 0);
    const novo = Math.max(0, atualQtd + delta);
    const novoMapa = { ...(atual || {}), [tamanho]: novo };
    gravarEstoqueLocal(prodId, novoMapa);
    setEstoquePorTamanho(novoMapa);
    return novo;
  }

  // ---------------------------
  // Carregar produto selecionado
  // ---------------------------
  useEffect(() => {
    const produtoSelecionado = JSON.parse(localStorage.getItem("produtoSelecionado"));

    if (!produtoSelecionado) {
      navigate("/");
      return;
    }

    // define tamanhos padrão
    let tamanhosDefinidos = produtoSelecionado.tamanhos || [];

    if (produtoSelecionado.categoria === "luvas") {
      tamanhosDefinidos = ["9", "10", "11", "12"];
    } else if (
      ["bolas", "caneleiras", "meioes"].includes(produtoSelecionado.categoria)
    ) {
      tamanhosDefinidos = [];
    }

    // merge produto com tamanhos definidos (mantendo estoque/avaliacao se existirem)
    const prod = { ...produtoSelecionado, tamanhos: tamanhosDefinidos };
    setProduto(prod);
    setImagemPrincipal(produtoSelecionado.imagem || "");
    setMiniaturas(produtoSelecionado.angulo || []);
    setCarregando(false);

    // carregar estoque local (se existir) ou do próprio JSON
    const estoqueLocal = lerEstoqueLocal(prod.id);
    if (estoqueLocal) setEstoquePorTamanho(estoqueLocal);
    else setEstoquePorTamanho(prod.estoque ? { ...prod.estoque } : {});

    carregarVariacoes(produtoSelecionado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ---------------------------
  // Carregar variações do mesmo produto
  // ---------------------------
  async function carregarVariacoes(produtoBase) {
    const arquivos = ["chuteiras", "bolas", "meioes", "luvas", "camisas", "caneleiras"];

    try {
      const promises = arquivos.map(async (nome) => {
        const res = await fetch(`/json/${nome}.json`);
        return res.ok ? await res.json() : [];
      });

      const todos = (await Promise.all(promises)).flat();

      const filtradas = todos.filter(
        (p) => p.nome === produtoBase.nome && p.id !== produtoBase.id
      );

      setVariacoes(filtradas);
    } catch (error) {
      console.log("Erro ao carregar variações:", error);
    }
  }

  // ---------------------------
  // Mostrar alert bonito
  // ---------------------------
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

  // ---------------------------
  // RENDER: estrelas da avaliação
  // ---------------------------
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

  // ---------------------------
  // Selecionar tamanho (bolinha)
  // ---------------------------
  function selecionarTamanho(t) {
    setTamanhoSelecionado(String(t));
  }

  // ---------------------------
  // Adicionar ao carrinho (NAO decrementa estoque)
  // ---------------------------
  function adicionarAoCarrinho() {
    if (produto.tamanhos?.length > 0 && !tamanhoSelecionado) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

    const qtd = Number(estoquePorTamanho?.[tamanhoSelecionado] ?? produto.estoque?.[tamanhoSelecionado] ?? 0);
    if (produto.tamanhos?.length > 0 && qtd <= 0) {
      alert("Tamanho sem estoque.");
      return;
    }

    // 🔹 CORREÇÃO: Usar a chave dinâmica (cart_ID)
    const key = getCartKey();
    const raw = localStorage.getItem(key);
    let carrinho = raw ? JSON.parse(raw) : [];

    const item = {
      id: produto.id,
      uid: produto.uid || `${produto.id}`,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: produto.preco,
      tamanho: tamanhoSelecionado || "Único",
      quantity: 1,
    };

    const idx = carrinho.findIndex(
      (it) => it.id === item.id && it.tamanho === item.tamanho
    );

    if (idx >= 0) carrinho[idx].quantity++;
    else carrinho.push(item);

    localStorage.setItem(key, JSON.stringify(carrinho));
    
    // Dispara evento para o Header atualizar
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: carrinho }));

    mostrarFeedback(`${produto.nome} adicionado ao carrinho!`);
    return item;
  }

  // ---------------------------
  // Comprar agora 
  // ---------------------------
  function comprarAgora() {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) {
      localStorage.setItem("redirecionarParaPagamento", "1");
      navigate("/login");
      return;
    }

    if (produto.tamanhos?.length > 0 && !tamanhoSelecionado) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

    const qtd = Number(estoquePorTamanho?.[tamanhoSelecionado] ?? produto.estoque?.[tamanhoSelecionado] ?? 0);
    if (produto.tamanhos?.length > 0 && qtd <= 0) {
      alert("Tamanho sem estoque.");
      return;
    }

    const item = {
      id: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: produto.preco,
      tamanho: tamanhoSelecionado || "Único",
      quantity: 1,
    };

    localStorage.removeItem("compraAtual");
    localStorage.setItem("compraAtual", JSON.stringify([item]));

    mostrarFeedback("Produto reservado. Indo para pagamento...");
    navigate("/pagamento");
  }

  if (carregando || !produto) {
    return (
      <main className="produto-detalhe" style={{ textAlign: "center", padding: 40 }}>
        Carregando produto...
      </main>
    );
  }

  const qtdSelecionada =
    tamanhoSelecionado && (estoquePorTamanho?.[tamanhoSelecionado] ?? produto.estoque?.[tamanhoSelecionado] ?? 0);

  return (
    <main className="produto-detalhe">
      <div className="imagem-produto">
        <img src={imagemPrincipal} alt={produto.nome} className="imagem-principal" />

        <div className="miniaturas">
          {miniaturas.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Miniatura ${i}`}
              className={`miniatura ${img === imagemPrincipal ? "ativo" : ""}`}
              onClick={() => setImagemPrincipal(img)}
            />
          ))}
        </div>
      </div>

      <div className="info-produto">
        <h1>{produto.nome}</h1>

        {produto.avaliacao !== undefined && (
          <div className="avaliacao-produto" aria-hidden>
            <span className="estrelas">{renderEstrelas(produto.avaliacao)}</span>
            <span className="nota">{produto.avaliacao.toFixed(1)}</span>
            <span className="quantidade">({produto.numAvaliacoes})</span>
          </div>
        )}

        <p>{produto.descricao}</p>

        <p className="preco">
          R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
        </p>

        {produto.tamanhos?.length > 0 && (
          <>
            <label>Tamanho</label>
            <div className="tamanhos-opcoes" role="tablist" aria-label="Tamanhos">
              {produto.tamanhos.map((t) => {
                const tStr = String(t);
                const disponível = Number(estoquePorTamanho?.[tStr] ?? produto.estoque?.[tStr] ?? 0) > 0;
                return (
                  <button
                    key={tStr}
                    type="button"
                    className={`tamanho-bolinha ${tamanhoSelecionado === tStr ? "ativo" : ""} ${!disponível ? "esgotado" : ""}`}
                    onClick={() => disponível && selecionarTamanho(tStr)}
                    aria-pressed={tamanhoSelecionado === tStr}
                    title={disponível ? `Tem ${estoquePorTamanho?.[tStr] ?? produto.estoque?.[tStr]} em estoque` : "Esgotado"}
                  >
                    {tStr}
                  </button>
                );
              })}
            </div>

            {tamanhoSelecionado && (
              <p className="info-estoque">
                {qtdSelecionada > 0 ? `Em estoque: ${qtdSelecionada} unidade(s)` : "Esgotado"}
              </p>
            )}
          </>
        )}

        {variacoes.length > 0 && (
          <div className="outras-variacoes-container">
            <h3>Outras variações</h3>

            <div className="outras-variacoes-cards">
              {variacoes.map((v) => (
                <div
                  key={v.id}
                  className="outras-variacao-card"
                  onClick={() => {
                    const cat = v.categoria || "";
                    const tamanhosAuto = cat === "luvas"
                      ? ["9", "10", "11", "12"]
                      : (["bolas", "caneleiras", "meioes"].includes(cat)
                        ? []
                        : v.tamanhos || []);

                    setProduto({ ...v, tamanhos: tamanhosAuto });
                    setImagemPrincipal(v.imagem || "");
                    setMiniaturas(v.angulo || []);
                    setTamanhoSelecionado("");
                    const estoqueLocal = lerEstoqueLocal(v.id);
                    setEstoquePorTamanho(estoqueLocal || (v.estoque ? { ...v.estoque } : {}));
                  }}
                >
                  <img src={v.imagem} alt={v.nome} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="botoes-compra">
          <button className="btn-carrinho" onClick={adicionarAoCarrinho}>
            Adicionar ao Carrinho
          </button>

          <button className="btn-comprar" onClick={comprarAgora}>
            Comprar Agora
          </button>
        </div>

        <div className="feedback-message" aria-live="polite">
          {mensagemFeedback}
        </div>
      </div>
    </main>
  );
}