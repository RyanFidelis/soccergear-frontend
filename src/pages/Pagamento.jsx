import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Pagamento.css";

export default function Pagamento() {
  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [metodo, setMetodo] = useState("pix");

  const [copiadoPix, setCopiadoPix] = useState(false);
  const [copiadoBoleto, setCopiadoBoleto] = useState(false);

  const [processando, setProcessando] = useState(false);

  const [dadosCartao, setDadosCartao] = useState({
    numero: "",
    nome: "",
    cpf: "",
    validade: "",
    cvv: "",
    tipo: "credito",
    bandeira: "mastercard",
  });

  // APENAS UMA DECLARAÇÃO
  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://soccergear-backend.onrender.com";

  const chavePix =
    "00020126360014BR.GOV.BCB.PIX0114+55119999999990214PagamentoTeste52040000530398654041.005802BR5925SoccerGear6014SAOPAULO62070503***6304ABCD";

  const qrCodeURL =
    "https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=" +
    encodeURIComponent(chavePix);

  const linhaDigitavel =
    "34191.79001 01043.510047 91020.150008 8 12340000025000";

  const linhaDigitavelCopiar =
    "34191790010104351004791020150008812340000025000";

  useEffect(() => {
    const usuario = localStorage.getItem("usuarioLogado");

    if (!usuario) {
      alert("Você precisa estar logado para finalizar a compra.");

      localStorage.setItem("redirectAfterLogin", "/pagamento");

      navigate("/login");
      return;
    }

    const compra = JSON.parse(localStorage.getItem("compraAtual"));

    if (!compra || compra.length === 0) {
      navigate("/");
      return;
    }

    setItens(compra);
  }, [navigate]);

  const handleInputCartao = (e) => {
    const { name, value } = e.target;

    setDadosCartao((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const itemFrete = itens.find(
    (i) => i.id === "frete-checkout"
  );

  const produtosReais = itens.filter(
    (i) => i.id !== "frete-checkout"
  );

  const subtotal = produtosReais.reduce(
    (sum, item) =>
      sum + Number(item.preco) * (item.quantity || 1),
    0
  );

  const valorFrete = itemFrete
    ? Number(itemFrete.preco)
    : 0;

  const totalFinal = subtotal + valorFrete;

  const removerItem = (itemParaRemover) => {
    const novosItens = itens.filter(
      (i) => i !== itemParaRemover
    );

    const aindaTemProdutos = novosItens.some(
      (i) => i.id !== "frete-checkout"
    );

    if (!aindaTemProdutos) {
      localStorage.removeItem("compraAtual");
      navigate("/");
      return;
    }

    setItens(novosItens);

    localStorage.setItem(
      "compraAtual",
      JSON.stringify(novosItens)
    );
  };

  const finalizar = async () => {
    if (processando) return;

    if (metodo === "cartao") {
      if (
        !dadosCartao.numero ||
        !dadosCartao.nome ||
        !dadosCartao.cpf ||
        !dadosCartao.validade ||
        !dadosCartao.cvv
      ) {
        alert(
          "Por favor, preencha todos os dados do cartão."
        );
        return;
      }
    }

    setProcessando(true);

    try {
      const usuarioString =
        localStorage.getItem("usuarioLogado");

      const usuario = usuarioString
        ? JSON.parse(usuarioString)
        : null;

      if (!usuario || !usuario.id) {
        alert("Faça login novamente.");
        navigate("/login");
        return;
      }

      const pedido = {
        cliente: usuario,
        itens: produtosReais,
        metodo,
        detalhesPagamento:
          metodo === "cartao"
            ? dadosCartao
            : null,
        total: parseFloat(totalFinal.toFixed(2)),
        status: "aguardando",
      };

      const response = await fetch(
        `${API_URL}/api/pedido/novo`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(pedido),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao criar pedido"
        );
      }

      alert(
        "Pedido enviado com sucesso para análise."
      );

      const cartKey = usuario.id
        ? `cart_${usuario.id}`
        : "cart_guest";

      localStorage.removeItem(cartKey);

      localStorage.removeItem("compraAtual");

      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: [],
        })
      );

      navigate("/minhas-compras");
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao finalizar pedido: " +
          error.message
      );
    } finally {
      setProcessando(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(chavePix);

    setCopiadoPix(true);

    setTimeout(() => {
      setCopiadoPix(false);
    }, 2000);
  };

  const copiarBoleto = () => {
    navigator.clipboard.writeText(
      linhaDigitavelCopiar
    );

    setCopiadoBoleto(true);

    setTimeout(() => {
      setCopiadoBoleto(false);
    }, 2000);
  };

  if (!itens.length) return null;

  return (
    <main className="pagamento-container">
      <h1>Finalizar Pagamento</h1>

      <h2>Itens da compra:</h2>

      {produtosReais.map((item, index) => (
        <div
          key={index}
          className="pagamento-item-linha"
        >
          <img
            src={item.imagem}
            alt={item.nome}
          />

          <div>
            <p>
              <strong>{item.nome}</strong>
            </p>

            <p>Tamanho: {item.tamanho}</p>

            <p>
              Quantidade: {item.quantity}
            </p>

            <p>
              R$ {Number(item.preco).toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => removerItem(item)}
          >
            Remover
          </button>
        </div>
      ))}

      <div className="resumo-pagamento">
        <p>
          Subtotal: R$ {subtotal.toFixed(2)}
        </p>

        <p>
          Frete: R$ {valorFrete.toFixed(2)}
        </p>

        <h2>
          Total: R$ {totalFinal.toFixed(2)}
        </h2>
      </div>

      <h2>Método de pagamento:</h2>

      <div className="pagamento-opcoes">
        <button
          onClick={() => setMetodo("pix")}
          className={
            metodo === "pix" ? "ativo" : ""
          }
        >
          Pix
        </button>

        <button
          onClick={() => setMetodo("cartao")}
          className={
            metodo === "cartao"
              ? "ativo"
              : ""
          }
        >
          Cartão
        </button>

        <button
          onClick={() => setMetodo("boleto")}
          className={
            metodo === "boleto"
              ? "ativo"
              : ""
          }
        >
          Boleto
        </button>
      </div>

      {metodo === "pix" && (
        <div className="pagamento-pix-box">
          <h3>Pagamento via Pix</h3>

          <img
            src={qrCodeURL}
            alt="QR Code Pix"
            className="pagamento-qrcode"
          />

          <textarea
            readOnly
            value={chavePix}
            className="pagamento-copiacola"
          />

          <button onClick={copiarPix}>
            {copiadoPix
              ? "Copiado!"
              : "Copiar"}
          </button>
        </div>
      )}

      {metodo === "boleto" && (
        <div className="pagamento-boleto-box">
          <h3>Boleto Bancário</h3>

          <img
            src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${linhaDigitavelCopiar}`}
            alt="Boleto"
            className="barcode-img"
          />

          <input
            readOnly
            value={linhaDigitavel}
          />

          <button onClick={copiarBoleto}>
            {copiadoBoleto
              ? "Copiado!"
              : "Copiar"}
          </button>
        </div>
      )}

      {metodo === "cartao" && (
        <div className="pagamento-cartao-box">
          <h3>Dados do Cartão</h3>

          <input
            type="text"
            name="numero"
            placeholder="Número do cartão"
            value={dadosCartao.numero}
            onChange={handleInputCartao}
          />

          <input
            type="text"
            name="nome"
            placeholder="Nome do titular"
            value={dadosCartao.nome}
            onChange={handleInputCartao}
          />

          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={dadosCartao.cpf}
            onChange={handleInputCartao}
          />

          <input
            type="text"
            name="validade"
            placeholder="MM/AA"
            value={dadosCartao.validade}
            onChange={handleInputCartao}
          />

          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={dadosCartao.cvv}
            onChange={handleInputCartao}
          />

          <select
            name="bandeira"
            value={dadosCartao.bandeira}
            onChange={handleInputCartao}
          >
            <option value="mastercard">
              Mastercard
            </option>

            <option value="visa">
              Visa
            </option>

            <option value="elo">
              Elo
            </option>

            <option value="amex">
              American Express
            </option>

            <option value="hipercard">
              Hipercard
            </option>
          </select>
        </div>
      )}

      <button
        className="pagamento-btn-finalizar"
        onClick={finalizar}
        disabled={processando}
      >
        {processando
          ? "Processando..."
          : "Finalizar Pedido"}
      </button>
    </main>
  );
}
