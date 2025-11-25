import React, { useEffect, useState } from "react";
import "../css/Favoritos.css";

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [feedback, setFeedback] = useState("");

  // 🔄 Carrega os favoritos do localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favoritos")) || [];
    setFavoritos(saved);
  }, []);

  // 🗑️ Remove um favorito
  const removerFavorito = (id) => {
    const atualizados = favoritos.filter((p) => String(p.id) !== String(id));
    const removido = favoritos.find((p) => String(p.id) === String(id));
    setFavoritos(atualizados);
    localStorage.setItem("favoritos", JSON.stringify(atualizados));
    mostrarFeedback(`${removido?.nome || "Produto"} removido dos favoritos`);
  };

  // 🛒 Abre o produto clicado
  const abrirProduto = (id) => {
    const produto = favoritos.find((p) => String(p.id) === String(id));
    if (!produto) return;
    localStorage.setItem("produtoSelecionado", JSON.stringify(produto));
    window.location.href = "/verproduto";
  };

  // 💬 Mostra mensagem temporária
  const mostrarFeedback = (mensagem) => {
    setFeedback(mensagem);
    setTimeout(() => setFeedback(""), 2000);
  };

  // 🔹 Caso não tenha favoritos
  if (favoritos.length === 0) {
    return (
      <main className="favoritos-vazio">
        <h1>Meus Favoritos</h1>
        <p>Você ainda não favoritou nenhum produto ⭐</p>
        {feedback && (
          <div className="feedback-message-favoritos show">{feedback}</div>
        )}
      </main>
    );
  }

  // 🔹 Renderização normal
  return (
    <main className="favoritos-container">
      <h1>Meus Favoritos</h1>
      <div className="grid-favoritos">
        {favoritos.map((prod) => (
          <div
            key={prod.id}
            className="produto-card-favoritos"
            onClick={() => abrirProduto(prod.id)}
          >
            <div className="thumb-wrap">
              <img
                src={prod.imagem || ""}
                alt={prod.nome || ""}
                className="produto-imagem-favoritos"
              />
            </div>
            <h4>{prod.nome}</h4>
            <p className="preco-favoritos">
              R$ {Number(prod.preco || 0).toFixed(2).replace(".", ",")}
            </p>
            <div className="produto-acoes-favoritos">
              <span
                className="estrela-favorito-favoritos"
                title="Remover favorito"
                role="button"
                onClick={(e) => {
                  e.stopPropagation(); // impede abrir o produto ao clicar na estrela
                  removerFavorito(prod.id);
                }}
              >
                ⭐
              </span>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className="feedback-message-favoritos show">{feedback}</div>
      )}
    </main>
  );
}
