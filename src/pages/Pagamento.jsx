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
    bandeira: "mastercard"
  });

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
    setDadosCartao((prev) => ({ ...prev, [name]: value }));
  };

  if (!itens.length) return null;

  const total = itens.reduce(
    (sum, it) => sum + Number(it.preco) * (it.quantity || 1),
    0
  );

  const removerItem = (index) => {
    const nova = itens.filter((_, i) => i !== index);
    if (!nova.length) {
      localStorage.removeItem("compraAtual");
      navigate("/");
      return;
    }
    setItens(nova);
    localStorage.setItem("compraAtual", JSON.stringify(nova));
  };

  const finalizar = async () => {
    if (processando) return;

    if (metodo === "cartao") {
      if (!dadosCartao.numero || !dadosCartao.nome || !dadosCartao.cpf || !dadosCartao.validade || !dadosCartao.cvv) {
        alert("Por favor, preencha todos os dados do cartão.");
        return;
      }
    }

    setProcessando(true);

    const usuarioString = localStorage.getItem("usuarioLogado");
    const usuario = usuarioString ? JSON.parse(usuarioString) : null;

    if (!usuario || !usuario.id) {
      alert("Erro de Identificação: Faça login novamente para continuar.");
      setProcessando(false);
      navigate("/login");
      return;
    }

    const pedido = { 
      cliente: usuario, 
      itens: itens, 
      metodo: metodo,
      detalhesPagamento: metodo === "cartao" ? dadosCartao : null, 
      total: parseFloat(total.toFixed(2)), 
      status: "aguardando" 
    };

    try {
      const req = await fetch(`${API_URL}/api/pedido/novo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      const res = await req.json();

      if (req.ok && res.sucesso) {
        alert("Sucesso! Seu pedido foi enviado para análise.");

        const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];
        notificacoes.unshift({
          id: Date.now(),
          titulo: "Pagamento em análise",
          descricao: `Seu pedido de R$ ${total.toFixed(2)} via ${metodo} está aguardando aprovação.`,
          categoria: "pendente",
          data: new Date(),
          lida: false,
          dataFormatada: new Date().toLocaleString("pt-BR"),
        });
        localStorage.setItem("notificacoes", JSON.stringify(notificacoes));

        const minhasCompras = JSON.parse(localStorage.getItem("minhasCompras")) || [];
        minhasCompras.push({
          data: new Date().toLocaleString("pt-BR"),
          itens,
          total,
          status: "aguardando",
          metodo
        });
        localStorage.setItem("minhasCompras", JSON.stringify(minhasCompras));

        localStorage.removeItem("cart");
        localStorage.removeItem("compraAtual");
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: [] }));
        
        navigate("/notificacoes");
      } else {
        console.error("Erro do Backend:", res);
        alert(`Erro ao registrar pedido: ${res.message || "Erro desconhecido no servidor."}`);
      }
    } catch (err) {
      console.error("Erro de Conexão:", err);
      alert("Não foi possível conectar ao servidor.");
    } finally {
      setProcessando(false);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2000);
  };

  const copiarBoleto = () => {
    navigator.clipboard.writeText(linhaDigitavelCopiar);
    setCopiadoBoleto(true);
    setTimeout(() => setCopiadoBoleto(false), 2000);
  };

  return (
    <main className="pagamento-container">
      <h1>Finalizar Pagamento</h1>

      <h2>Itens da compra:</h2>
      {itens.map((it, index) => (
        <div key={index} className="pagamento-item-linha">
          <img src={it.imagem} alt={it.nome} />
          <div>
            <p><strong>{it.nome}</strong></p>
            <p>Tamanho: {it.tamanho}</p>
            <p>Quantidade: {it.quantity}</p>
            <p>R$ {Number(it.preco).toFixed(2)}</p>
          </div>
          <button onClick={() => removerItem(index)}>Remover</button>
        </div>
      ))}

      <h2>Total: R$ {total.toFixed(2)}</h2>

      <h2>Selecione o método de pagamento:</h2>

      <div className="pagamento-opcoes">
        <button onClick={() => setMetodo("pix")} className={metodo === "pix" ? "ativo" : ""}>Pix</button>
        <button onClick={() => setMetodo("cartao")} className={metodo === "cartao" ? "ativo" : ""}>Cartão</button>
        <button onClick={() => setMetodo("boleto")} className={metodo === "boleto" ? "ativo" : ""}>Boleto</button>
      </div>

      {metodo === "pix" && (
        <div className="pagamento-pix-box">
          <h3>Pagamento via Pix</h3>
          <img src={qrCodeURL} alt="QR Code Pix" className="pagamento-qrcode" />
          <p className="pagamento-copiacola-label">Pix copia e cola:</p>
          <textarea readOnly value={chavePix} className="pagamento-copiacola" />
          <button className={`pagamento-btn-copiar ${copiadoPix ? "copiado" : ""}`} onClick={copiarPix}>
            {copiadoPix ? "copiado!" : "copiar"}
          </button>
        </div>
      )}

      {metodo === "boleto" && (
        <div className="pagamento-boleto-box">
          <h3>Boleto Bancário</h3>
          <img
            src={"https://bwipjs-api.metafloor.com/?bcid=code128&text=" + linhaDigitavelCopiar}
            alt="Código de Barras do Boleto"
            className="barcode-img"
          />
          <p>Linha digitável:</p>
          <input readOnly value={linhaDigitavel} />
          <button className={`pagamento-btn-copiar ${copiadoBoleto ? "copiado" : ""}`} onClick={copiarBoleto}>
            {copiadoBoleto ? "copiado!" : "copiar"}
          </button>
        </div>
      )}

      {metodo === "cartao" && (
        <div className="pagamento-cartao-box">
          <h3>Dados do Cartão</h3>
          
          <div className="form-cartao">
            <div className="linha-tipo">
              <label>
                <input 
                  type="radio" 
                  name="tipo" 
                  value="credito" 
                  checked={dadosCartao.tipo === "credito"} 
                  onChange={handleInputCartao} 
                /> Crédito
              </label>
              <label>
                <input 
                  type="radio" 
                  name="tipo" 
                  value="debito" 
                  checked={dadosCartao.tipo === "debito"} 
                  onChange={handleInputCartao} 
                /> Débito
              </label>
            </div>

            <div className="campo-cartao">
              <label>Número do Cartão</label>
              <input 
                type="text" 
                name="numero" 
                placeholder="0000 0000 0000 0000"
                value={dadosCartao.numero} 
                onChange={handleInputCartao}
                maxLength="19"
              />
            </div>

            <div className="campo-cartao">
              <label>Nome do Titular (Como no cartão)</label>
              <input 
                type="text" 
                name="nome" 
                placeholder="NOME IMPRESSO"
                value={dadosCartao.nome} 
                onChange={handleInputCartao}
              />
            </div>

            <div className="campo-cartao">
              <label>CPF do Titular</label>
              <input 
                type="text" 
                name="cpf" 
                placeholder="000.000.000-00"
                value={dadosCartao.cpf} 
                onChange={handleInputCartao}
                maxLength="14"
              />
            </div>

            <div className="linha-dupla">
              <div className="campo-cartao">
                <label>Validade</label>
                <input 
                  type="text" 
                  name="validade" 
                  placeholder="MM/AA"
                  value={dadosCartao.validade} 
                  onChange={handleInputCartao}
                  maxLength="5"
                />
              </div>
              <div className="campo-cartao">
                <label>CVV</label>
                <input 
                  type="text" 
                  name="cvv" 
                  placeholder="123"
                  value={dadosCartao.cvv} 
                  onChange={handleInputCartao}
                  maxLength="4"
                />
              </div>
            </div>

            <div className="campo-cartao">
              <label>Bandeira</label>
              <select name="bandeira" value={dadosCartao.bandeira} onChange={handleInputCartao}>
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
                <option value="elo">Elo</option>
                <option value="amex">American Express</option>
                <option value="hipercard">Hipercard</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <button 
        className="pagamento-btn-finalizar" 
        onClick={finalizar} 
        disabled={processando}
        style={{ opacity: processando ? 0.7 : 1, cursor: processando ? 'wait' : 'pointer' }}
      >
        {processando ? "Processando..." : "Finalizar Pedido"}
      </button>
    </main>
  );
}