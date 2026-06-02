import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { Link } from "react-router-dom";

import "../css/Minhas-compras.css";

export default function MinhasCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://soccergear-backend.onrender.com";

  const carregarCompras = useCallback(async () => {
    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!usuario || !usuario.id) {
      setErro("Usuário não encontrado.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/pedido/meus-pedidos/${usuario.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Erro ${response.status}`
        );
      }

      const pedidos = await response.json();

      if (Array.isArray(pedidos)) {
        const pedidosAtivos =
          pedidos.filter((pedido) => {
            const status = pedido.status
              ? pedido.status.toLowerCase()
              : "";

            return (
              status !== "rejeitado" &&
              status !== "cancelado"
            );
          });

        const pedidosOrdenados =
          pedidosAtivos.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );

        setCompras(pedidosOrdenados);
      } else {
        setCompras([]);
      }

      setErro(null);
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar seus pedidos."
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    carregarCompras();

    const intervalo = setInterval(() => {
      carregarCompras();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [carregarCompras]);

  if (loading) {
    return (
      <main className="minhas-compras-container">
        <h1>Minhas Compras</h1>

        <p>Carregando pedidos...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="minhas-compras-container">
        <h1>Minhas Compras</h1>

        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="minhas-compras-container">
      <h1>Minhas Compras</h1>

      {compras.length === 0 ? (
        <div className="sem-compras">
          <p>
            Você ainda não possui pedidos.
          </p>

          <Link to="/">
            Ir para loja
          </Link>
        </div>
      ) : (
        <div className="lista-compras">
          {compras.map((pedido) => (
            <div
              key={pedido.id}
              className="card-compra"
            >
              <div className="topo-compra">
                <h2>
                  Pedido #
                  {pedido.id}
                </h2>

                <span
                  className={`status-compra ${pedido.status?.toLowerCase()}`}
                >
                  {pedido.status}
                </span>
              </div>

              <div className="info-compra">
                <p>
                  <strong>
                    Data:
                  </strong>{" "}
                  {new Date(
                    pedido.createdAt
                  ).toLocaleString(
                    "pt-BR"
                  )}
                </p>

                <p>
                  <strong>
                    Total:
                  </strong>{" "}
                  R${" "}
                  {Number(
                    pedido.total || 0
                  )
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </div>

              {pedido.itens &&
                pedido.itens.length > 0 && (
                  <div className="itens-compra">
                    {pedido.itens.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="item-compra"
                        >
                          <img
                            src={
                              item.imagem
                            }
                            alt={
                              item.nome
                            }
                          />

                          <div>
                            <h3>
                              {item.nome}
                            </h3>

                            <p>
                              Quantidade:{" "}
                              {
                                item.quantidade
                              }
                            </p>

                            <p>
                              Tamanho:{" "}
                              {item.tamanho}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```
