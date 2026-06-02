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

  const API_URL = process.env.REACT_APP_API_URL;

  const chavePix =
    "00020126360014BR.GOV.BCB.PIX0114+55119999999990214Pagamento Teste52040000530398654041.005802BR5925SoccerGear Pagamento6014SAO PAULO BR62070503***6304ABCD";

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
      alert("Você precisa estar logado.");
      navigate("/login");
      return;
    }

    const compra = JSON.parse(
      localStorage.getItem("compraAtual")
    );

    if (!compra || compra.length === 0) {
      navigate("/");
      return;
    }

    setItens(compra);
  }, [navigate]);

  if (!itens.length) return null;

  const total = itens.reduce(
    (sum, item) =>
      sum + Number(item.preco) * (item.quantity || 1),
    0
  );

  const removerItem = (index) => {
    const novaLista = itens.filter((_, i) => i !== index);

    if (novaLista.length === 0) {
      localStorage.removeItem("compraAtual");
      navigate("/");
      return;
    }

    setItens(novaLista);

    localStorage.setItem(
      "compraAtual",
      JSON.stringify(novaLista)
    );
  };

  const finalizar = async () => {
    if (processando) return;

    setProcessando(true);

    try {
      if (!API_URL) {
        throw new Error(
          "REACT_APP_API_URL não configurada"
        );
      }

      const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado")
      );

      if (!usuario?.id) {
        alert("Faça login novamente.");
        navigate("/login");
        return;
      }

      const pedido = {
        cliente: usuario,
        itens,
        metodo,
        total: Number(total.toFixed(2)),
        status: "aguardando",
      };

      console.log("ENVIANDO PEDIDO:", pedido);

      const response = await fetch(
        `${API_URL}/api/pedido/novo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pedido),
        }
      );

      const texto = await response.text();

      let data = {};

      try {
        data = JSON.parse(texto);
      } catch {
        console.error("Resposta não é JSON:", texto);
        throw new Error("Servidor retornou HTML");
      }

      console.log("RESPOSTA BACKEND:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao criar pedido"
        );
      }

      alert(
        "Pedido enviado com sucesso para análise."
      );

      localStorage.removeItem("cart");
      localStorage.removeItem("compraAtual");

      window.dispatchEvent(
        new CustomEvent("cart-updated")
      );

      navigate("/minhas-compras");

    } catch (error) {
      console.error("ERRO FINALIZAR:", error);

      alert(
        "Erro ao finalizar pedido: " + error.message
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

  return (
    <main className="pagamento-container">
      <h1>Finalizar Pagamento</h1>

      <h2>Itens da compra:</h2>

      {itens.map((item, index) => (
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

            <p>
              Tamanho: {item.tamanho}
            </p>

            <p>
              Quantidade: {item.quantity}
            </p>

            <p>
              R${" "}
              {Number(item.preco).toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => removerItem(index)}
          >
            Remover
          </button>
        </div>
      ))}

      <h2>
        Total: R$ {total.toFixed(2)}
      </h2>

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

          <p className="pagamento-copiacola-label">
            Pix copia e cola:
          </p>

          <textarea
            readOnly
            value={chavePix}
            className="pagamento-copiacola"
          />

          <button
            className={`pagamento-btn-copiar ${
              copiadoPix ? "copiado" : ""
            }`}
            onClick={copiarPix}
          >
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

          <p>Linha digitável:</p>

          <input
            readOnly
            value={linhaDigitavel}
          />

          <button
            className={`pagamento-btn-copiar ${
              copiadoBoleto
                ? "copiado"
                : ""
            }`}
            onClick={copiarBoleto}
          >
            {copiadoBoleto
              ? "Copiado!"
              : "Copiar"}
          </button>
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