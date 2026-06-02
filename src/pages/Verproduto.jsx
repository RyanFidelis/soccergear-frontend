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

<<<<<<< HEAD
=======
  const [cep, setCep] = useState("");
  const [freteInfo, setFreteInfo] = useState(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const getCartKey = () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    return usuario && usuario.id ? `cart_${usuario.id}` : "cart_guest";
  };

>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
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
<<<<<<< HEAD
      console.error("Erro ao salvar estoqueLocal", e);
    }
  }

  function atualizarEstoque(prodId, tamanho, delta) {
    const atual = lerEstoqueLocal(prodId) || { ...produto.estoque };
    const atualQtd = Number(atual[tamanho] ?? produto.estoque?.[tamanho] ?? 0);
    const novo = Math.max(0, atualQtd + delta);
    const novoMapa = { ...(atual || {}), [tamanho]: novo };
    gravarEstoqueLocal(prodId, novoMapa);
    setEstoquePorTamanho(novoMapa);
    return novo;
  }

  useEffect(() => {
    const produtoSelecionado = JSON.parse(localStorage.getItem("produtoSelecionado"));
=======
      console.error(e);
    }
  }

  useEffect(() => {
    const produtoSelecionado = JSON.parse(localStorage.getItem("produtoSelecionado"));
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db

    if (!produtoSelecionado) {
      navigate("/");
      return;
    }

    let tamanhosDefinidos = produtoSelecionado.tamanhos || [];

    if (produtoSelecionado.categoria === "luvas") {
      tamanhosDefinidos = ["9", "10", "11", "12"];
    } else if (
      ["bolas", "caneleiras", "meioes"].includes(produtoSelecionado.categoria)
    ) {
      tamanhosDefinidos = [];
    }

    const prod = { ...produtoSelecionado, tamanhos: tamanhosDefinidos };
<<<<<<< HEAD

    setProduto(prod);
    setImagemPrincipal(produtoSelecionado.imagem || "");

    const imagens = [
      produtoSelecionado.imagem,
      ...(produtoSelecionado.angulo || []).filter(
        (img) => img && img !== produtoSelecionado.imagem
      )
    ];

    setMiniaturas(imagens);

    setCarregando(false);

    const estoqueLocal = lerEstoqueLocal(prod.id);

    if (estoqueLocal) setEstoquePorTamanho(estoqueLocal);
    else setEstoquePorTamanho(prod.estoque ? { ...prod.estoque } : {});

=======
    setProduto(prod);
    setImagemPrincipal(produtoSelecionado.imagem || "");
    setMiniaturas(produtoSelecionado.angulo || []);
    setCarregando(false);

    const estoqueLocal = lerEstoqueLocal(prod.id);
    if (estoqueLocal) setEstoquePorTamanho(estoqueLocal);
    else setEstoquePorTamanho(prod.estoque ? { ...prod.estoque } : {});

    if (usuarioLogado && usuarioLogado.endereco) {
      setCep(usuarioLogado.endereco);
    }

>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    carregarVariacoes(produtoSelecionado);
  }, [navigate]);

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
<<<<<<< HEAD
      console.log("Erro ao carregar variações:", error);
=======
      console.log(error);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    }
  }

  function mostrarFeedback(msg) {
    setMensagemFeedback(msg);
    const el = document.querySelector(".feedback-message");
<<<<<<< HEAD

    if (el) {
      el.classList.add("show");

=======
    if (el) {
      el.classList.add("show");
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
      setTimeout(() => {
        el.classList.remove("show");
      }, 1500);
    }
  }

  function renderEstrelas(nota) {
    if (!nota && nota !== 0) return null;
<<<<<<< HEAD

    const full = Math.floor(nota);
    const meio = nota - full >= 0.5;
    const vazias = 5 - full - (meio ? 1 : 0);

=======
    const full = Math.floor(nota);
    const meio = nota - full >= 0.5;
    const vazias = 5 - full - (meio ? 1 : 0);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
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
    if (produto.tamanhos?.length > 0 && !tamanhoSelecionado) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

<<<<<<< HEAD
    const qtd = Number(
      estoquePorTamanho?.[tamanhoSelecionado] ??
      produto.estoque?.[tamanhoSelecionado] ??
      0
    );

=======
    const qtd = Number(estoquePorTamanho?.[tamanhoSelecionado] ?? produto.estoque?.[tamanhoSelecionado] ?? 0);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    if (produto.tamanhos?.length > 0 && qtd <= 0) {
      alert("Tamanho sem estoque.");
      return;
    }

<<<<<<< HEAD
    const raw = localStorage.getItem("cart");
=======
    const key = getCartKey();
    const raw = localStorage.getItem(key);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
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

<<<<<<< HEAD
    localStorage.setItem("cart", JSON.stringify(carrinho));

    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: carrinho })
    );

    mostrarFeedback(`${produto.nome} adicionado ao carrinho!`);

=======
    localStorage.setItem(key, JSON.stringify(carrinho));
    
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: carrinho }));

    mostrarFeedback(`${produto.nome} adicionado ao carrinho!`);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    return item;
  }

  function comprarAgora() {
    const usuario = localStorage.getItem("usuarioLogado");
<<<<<<< HEAD

=======
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    if (!usuario) {
      localStorage.setItem("redirecionarParaPagamento", "1");
      navigate("/login");
      return;
    }

    if (produto.tamanhos?.length > 0 && !tamanhoSelecionado) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

<<<<<<< HEAD
    const qtd = Number(
      estoquePorTamanho?.[tamanhoSelecionado] ??
      produto.estoque?.[tamanhoSelecionado] ??
      0
    );

=======
    const qtd = Number(estoquePorTamanho?.[tamanhoSelecionado] ?? produto.estoque?.[tamanhoSelecionado] ?? 0);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
    if (produto.tamanhos?.length > 0 && qtd <= 0) {
      alert("Tamanho sem estoque.");
      return;
    }

<<<<<<< HEAD
    const item = {
=======
    if (!freteInfo) {
      alert("Por favor, informe o CEP para entrega antes de comprar!");
      return;
    }

    const itemProduto = {
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
      id: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      preco: produto.preco,
      tamanho: tamanhoSelecionado || "Único",
      quantity: 1,
    };

<<<<<<< HEAD
    localStorage.removeItem("compraAtual");

    localStorage.setItem(
      "compraAtual",
      JSON.stringify([item])
    );

    mostrarFeedback("Produto reservado. Indo para pagamento...");

    navigate("/pagamento");
  }

  if (carregando || !produto) {
    return (
      <main
        className="produto-detalhe"
        style={{ textAlign: "center", padding: 40 }}
      >
=======
    const listaParaPagar = [itemProduto];

    if (freteInfo && freteInfo.valor) {
        const valorFrete = parseFloat(freteInfo.valor.replace(',', '.'));
        if (valorFrete > 0) {
            const itemFrete = {
                id: "frete-checkout",
                nome: `Frete (${freteInfo.prazo})`,
                imagem: "https://cdn-icons-png.flaticon.com/512/759/759063.png",
                preco: valorFrete,
                tamanho: "-",
                quantity: 1
            };
            listaParaPagar.push(itemFrete);
        }
    }

    localStorage.removeItem("compraAtual");
    localStorage.setItem("compraAtual", JSON.stringify(listaParaPagar));

    mostrarFeedback("Indo para pagamento...");
    navigate("/pagamento");
  }

  const calcularFrete = async () => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (!cepLimpo) {
      alert("Por favor, informe o CEP para entrega!");
      return;
    }

    if (cepLimpo.length !== 8) {
      alert("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setLoadingFrete(true);
    setFreteInfo(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        setLoadingFrete(false);
        return;
      }

      let valor = 0;
      let prazo = "";

      if (data.localidade === "Santana de Parnaíba" && data.uf === "SP") {
        valor = 5.00;
        prazo = "1 dia útil (Local)";
      } else if (data.uf === "SP") {
        valor = 10.00;
        prazo = "2 a 4 dias úteis";
      } else {
        valor = 50.00;
        prazo = "5 a 10 dias úteis";
      }

      setFreteInfo({
        valor: valor.toFixed(2).replace(".", ","),
        prazo: prazo,
        cidade: data.localidade,
        uf: data.uf,
      });

    } catch (error) {
      console.error(error);
      alert("Erro ao calcular frete. Tente novamente.");
    } finally {
      setLoadingFrete(false);
    }
  };

  if (carregando || !produto) {
    return (
      <main className="produto-detalhe" style={{ textAlign: "center", padding: 40 }}>
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
        Carregando produto...
      </main>
    );
  }

  const qtdSelecionada =
<<<<<<< HEAD
    tamanhoSelecionado &&
    (
      estoquePorTamanho?.[tamanhoSelecionado] ??
      produto.estoque?.[tamanhoSelecionado] ??
      0
    );
=======
    tamanhoSelecionado && (estoquePorTamanho?.[tamanhoSelecionado] ?? produto.estoque?.[tamanhoSelecionado] ?? 0);
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db

  return (
    <main className="produto-detalhe">
      <div className="imagem-produto">
<<<<<<< HEAD
        <div className="imagem-principal-container">
          <img
            src={imagemPrincipal}
            alt={produto.nome}
            className="imagem-principal"
          />
        </div>

        <div className="miniaturas-linha">
          {miniaturas.map((img, i) => (
            <div
              key={i}
              className={`miniatura-box ${img === imagemPrincipal ? "ativo" : ""}`}
              onClick={() => setImagemPrincipal(img)}
            >
              <img
                src={img}
                alt={`Miniatura ${i}`}
                className="miniatura"
              />
            </div>
          ))}
        </div>
=======
        {/* Imagem Principal */}
        <img src={imagemPrincipal} alt={produto.nome} className="imagem-principal" />

        {/* Miniaturas em linha logo abaixo */}
        {miniaturas.length > 0 && (
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
        )}
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
      </div>

      <div className="info-produto">
        <h1>{produto.nome}</h1>

        {produto.avaliacao !== undefined && (
          <div className="avaliacao-produto" aria-hidden>
            <span className="estrelas">{renderEstrelas(produto.avaliacao)}</span>
            <span className="nota">{produto.avaliacao.toFixed(1)}</span>
<<<<<<< HEAD
            <span className="quantidade">
              ({produto.numAvaliacoes})
            </span>
=======
            <span className="quantidade">({produto.numAvaliacoes})</span>
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
          </div>
        )}

        <p>{produto.descricao}</p>

        <p className="preco">
          R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
        </p>

        {produto.tamanhos?.length > 0 && (
          <>
            <label>Tamanho</label>
<<<<<<< HEAD

            <div
              className="tamanhos-opcoes"
              role="tablist"
              aria-label="Tamanhos"
            >
              {produto.tamanhos.map((t) => {
                const tStr = String(t);

                const disponível =
                  Number(
                    estoquePorTamanho?.[tStr] ??
                    produto.estoque?.[tStr] ??
                    0
                  ) > 0;

=======
            <div className="tamanhos-opcoes" role="tablist" aria-label="Tamanhos">
              {produto.tamanhos.map((t) => {
                const tStr = String(t);
                const disponível = Number(estoquePorTamanho?.[tStr] ?? produto.estoque?.[tStr] ?? 0) > 0;
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
                return (
                  <button
                    key={tStr}
                    type="button"
<<<<<<< HEAD
                    className={`tamanho-bolinha ${tamanhoSelecionado === tStr ? "ativo" : ""
                      } ${!disponível ? "esgotado" : ""}`}
                    onClick={() => disponível && selecionarTamanho(tStr)}
                    aria-pressed={tamanhoSelecionado === tStr}
=======
                    className={`tamanho-bolinha ${tamanhoSelecionado === tStr ? "ativo" : ""} ${!disponível ? "esgotado" : ""}`}
                    onClick={() => disponível && selecionarTamanho(tStr)}
                    aria-pressed={tamanhoSelecionado === tStr}
                    title={disponível ? `Tem ${estoquePorTamanho?.[tStr] ?? produto.estoque?.[tStr]} em estoque` : "Esgotado"}
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
                  >
                    {tStr}
                  </button>
                );
              })}
            </div>

            {tamanhoSelecionado && (
              <p className="info-estoque">
<<<<<<< HEAD
                {qtdSelecionada > 0
                  ? `Em estoque: ${qtdSelecionada} unidade(s)`
                  : "Esgotado"}
=======
                {qtdSelecionada > 0 ? `Em estoque: ${qtdSelecionada} unidade(s)` : "Esgotado"}
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
              </p>
            )}
          </>
        )}

        {variacoes.length > 0 && (
          <div className="outras-variacoes-container">
            <h3>Outras variações</h3>
<<<<<<< HEAD

=======
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
            <div className="outras-variacoes-cards">
              {variacoes.map((v) => (
                <div
                  key={v.id}
                  className="outras-variacao-card"
                  onClick={() => {
                    const cat = v.categoria || "";
<<<<<<< HEAD

                    const tamanhosAuto =
                      cat === "luvas"
                        ? ["9", "10", "11", "12"]
                        : ["bolas", "caneleiras", "meioes"].includes(cat)
                          ? []
                          : v.tamanhos || [];

                    setProduto({ ...v, tamanhos: tamanhosAuto });

                    setImagemPrincipal(v.imagem || "");

                    const imagensAtualizadas = [
                      v.imagem,
                      ...(v.angulo || []).filter(
                        (img) => img && img !== v.imagem
                      )
                    ];

                    setMiniaturas(imagensAtualizadas);

                    setTamanhoSelecionado("");

                    const estoqueLocal = lerEstoqueLocal(v.id);

                    setEstoquePorTamanho(
                      estoqueLocal ||
                      (v.estoque ? { ...v.estoque } : {})
                    );

                    carregarVariacoes(v);
=======
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
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
                  }}
                >
                  <img src={v.imagem} alt={v.nome} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="botoes-compra">
<<<<<<< HEAD
          <button
            className="btn-carrinho"
            onClick={adicionarAoCarrinho}
          >
            Adicionar ao Carrinho
          </button>

          <button
            className="btn-comprar"
            onClick={comprarAgora}
          >
=======
          <button className="btn-carrinho" onClick={adicionarAoCarrinho}>
            Adicionar ao Carrinho
          </button>

          <button className="btn-comprar" onClick={comprarAgora}>
>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
            Comprar Agora
          </button>
        </div>

<<<<<<< HEAD
=======
        <div className="container-frete">
          <label className="label-frete">Calcular Frete e Prazo:</label>
          <div className="input-frete-wrapper">
            <input 
              type="text" 
              placeholder="00000-000" 
              maxLength="9"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="input-frete"
            />
            <button onClick={calcularFrete} disabled={loadingFrete} className="btn-calc-frete">
              {loadingFrete ? "..." : "OK"}
            </button>
          </div>
          
          <a 
            href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-nao-sei-cep"
          >
            Não sei meu CEP
          </a>

          {freteInfo && (
            <div className="resultado-frete">
              <p className="destino-frete">
                Entregar em: <strong>{freteInfo.cidade} - {freteInfo.uf}</strong>
              </p>
              <div className="detalhes-frete">
                <span className="valor-frete">R$ {freteInfo.valor}</span>
                <span className="prazo-frete">{freteInfo.prazo}</span>
              </div>
            </div>
          )}
        </div>

>>>>>>> 344c7d79af2025b4a48363db0b3b4b71df1649db
        <div className="feedback-message" aria-live="polite">
          {mensagemFeedback}
        </div>
      </div>
    </main>
  );
}