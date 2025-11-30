import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Carrinho.css";

export default function Carrinho() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

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

  const finalizarCompra = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
      localStorage.setItem("redirectAfterLogin", "/pagamento");
      navigate("/login");
      return;
    }

    localStorage.setItem("compraAtual", JSON.stringify(cart));
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

        <button onClick={finalizarCompra} className="botao-primario">
          Ir para Pagamento
        </button>
      </div>
    </main>
  );
}