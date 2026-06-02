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
        <h1>
