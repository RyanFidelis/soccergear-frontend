import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Carrinho.css";

export default function Carrinho() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  // --- Novos States para o Modal de Frete ---
  const [modalAberto, setModalAberto] = useState(false);
  const [cep, setCep] = useState("");
  const [freteInfo, setFreteInfo] = useState(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const getCartKey = () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    return usuario && usuario.id ? `cart_${usuario.id}` : "cart_guest";
  };

  function carregarCart() {
    const raw = localStorage.getItem(getCartKey());
    const stored = raw ? JSON.parse(raw) : [];
    setCart(stored);
  }

  useEffect(() => {
    carregarCart();

    const onStorage = (e) => {
      if (e.key === getCartKey()) carregarCart();
    };

    const onCartUpdated = () => carregarCart();

    window.addEventListener("storage", onStorage);
    window.addEventListener("cart-updated", onCartUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart-updated", onCartUpdated);
    };
  }, []);

  useEffect(() => {
    const total = cart.reduce(
      (sum, it) => sum + Number(it.preco) * (it.quantity || 1),
      0
    );
    setSubtotal(total);
  }, [cart]);

  const updateQuantity = (index, delta) => {
    const newCart = cart.map((it, i) =>
      i === index
        ? { ...it, quantity: Math.max((it.quantity || 1) + delta, 1) }
        : it
    );

    setCart(newCart);
    localStorage.setItem(getCartKey(), JSON.stringify(newCart));
    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: newCart })
    );
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem(getCartKey(), JSON.stringify(newCart));
    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: newCart })
    );
  };

  const iniciarFinalizacao = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
      localStorage.setItem("redirectAfterLogin", "/carrinho");
      navigate("/login");
      return;
    }

    if (usuario.endereco) {
        const cepSalvo = usuario.endereco.replace(/\D/g, "");
        if (cepSalvo.length === 8) {
            setCep(usuario.endereco);
        }
    }

    setModalAberto(true);
  };

  const calcularFrete = async () => {
    const cepLimpo = cep.replace(/\D/g, "");

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
        valor = 20.00;
        prazo = "5 a 10 dias úteis";
      }

      setFreteInfo({
        valor: valor,
        valorFormatado: valor.toFixed(2).replace(".", ","),
        prazo: prazo,
        cidade: data.localidade,
        uf: data.uf,
        rua: data.logradouro
      });

    } catch (error) {
      console.error(error);
      alert("Erro ao calcular. Tente novamente.");
    } finally {
      setLoadingFrete(false);
    }
  };

  const confirmarEIrParaPagamento = () => {
    if (!freteInfo) return;

    const listaFinal = [...cart];
    
    listaFinal.push({
        id: "frete-checkout",
        nome: `Frete (${freteInfo.prazo})`,
        imagem: "https://cdn-icons-png.flaticon.com/512/759/759063.png", 
        preco: freteInfo.valor,
        tamanho: "-",
        quantity: 1
    });

    localStorage.setItem("compraAtual", JSON.stringify(listaFinal));
    navigate("/pagamento");
  };

  return (
    <main className="main carrinho-container">
      <h1 className="titulo-carrinho">Meu Carrinho</h1>

      <section className="carrinho-itens">
        {cart.length === 0 ? (
          <p className="carrinho-vazio">Seu carrinho está vazio</p>
        ) : (
          cart.map((item, index) => (
            <div key={index} className="carrinho-item">
              <img src={item.imagem} alt={item.nome} />

              <div className="item-info">
                <h4>{item.nome}</h4>
                <p>R$ {Number(item.preco).toFixed(2)}</p>
                {item.tamanho && <p>Tamanho: {item.tamanho}</p>}

                <div className="item-quantidade">
                  <button onClick={() => updateQuantity(index, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(index, 1)}>+</button>
                </div>
              </div>

              <button className="remover-item" onClick={() => removeItem(index)}>
                ×
              </button>
            </div>
          ))
        )}
      </section>

      <div className="resumo-carrinho">
        <h3>Resumo do Pedido</h3>

        <div className="resumo-linha">
          <span>Subtotal:</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="resumo-linha total">
          <span>Total:</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>

        <button onClick={iniciarFinalizacao} className="botao-primario">
          Ir para Pagamento
        </button>
      </div>

      {/* --- MODAL DE FRETE --- */}
      {modalAberto && (
        <div className="modal-frete-overlay">
            <div className="modal-frete-content">
                <h3>Informe o Local de Entrega</h3>
                <p>Digite seu CEP para calcularmos o envio.</p>
                
                <div className="modal-input-group">
                    <input 
                        type="text" 
                        placeholder="00000-000" 
                        value={cep}
                        maxLength={9}
                        onChange={(e) => setCep(e.target.value)}
                    />
                    <button onClick={calcularFrete} disabled={loadingFrete}>
                        {loadingFrete ? "..." : "Calcular"}
                    </button>
                </div>

                {freteInfo && (
                    <div className="modal-resultado">
                        <p><strong>Destino:</strong> {freteInfo.rua}, {freteInfo.cidade}-{freteInfo.uf}</p>
                        <p><strong>Prazo:</strong> {freteInfo.prazo}</p>
                        <p className="valor-destaque">Valor: R$ {freteInfo.valorFormatado}</p>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
                    <button 
                        className="btn-confirmar" 
                        disabled={!freteInfo} 
                        onClick={confirmarEIrParaPagamento}
                    >
                        Confirmar e Pagar
                    </button>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}