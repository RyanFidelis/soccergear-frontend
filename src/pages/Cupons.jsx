import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../css/Cupons.css";

export default function Cupons() {
  const [cupons, setCupons] = useState([]);
  const [copiado, setCopiado] = useState(null);

  // 🔐 Inicializa Gemini se houver API key
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

  // ✨ Função para gerar cupom novo
  const gerarCupom = async () => {
    let novoCupom = null;

    try {
      if (model) {
        const prompt = `
          Gere um cupom curto e realista para uma loja de artigos esportivos de futebol.
          O cupom deve estar no formato JSON:
          {
            "tituloHeader": "Título curto do cupom",
            "codigo": "CÓDIGOEXEMPLO",
            "titulo": "Descrição curta do desconto",
            "descricao": "Detalhes rápidos sobre o benefício do cupom.",
            "validade": "DD/MM/YYYY",
            "desconto": "Ex: 20% OFF ou FRETE GRÁTIS",
            "tag": "Opcional — pode ser Oferta, Popular ou Relâmpago"
          }
        `;
        const result = await model.generateContent(prompt);
        const texto = result.response.text();
        const match = texto.match(/{[\s\S]*}/);
        novoCupom = match ? JSON.parse(match[0]) : null;
      }
    } catch (e) {
      console.warn("Falha ao gerar cupom via IA:", e.message);
    }

    // Fallback se Gemini falhar
    if (!novoCupom) {
      const exemplos = [
        {
          tituloHeader: "Desconto Imperdível",
          codigo: "GOLEADOR15",
          titulo: "15% OFF em chuteiras",
          descricao: "Modelos de chuteiras com desconto especial por tempo limitado.",
          validade: "30/11/2025",
          desconto: "15% OFF",
          tag: "Oferta",
        },
        {
          tituloHeader: "Frete Grátis Especial",
          codigo: "FRETEFC",
          titulo: "Frete Grátis acima de R$ 99",
          descricao: "Ganhe frete grátis em compras acima de R$ 99,00 em todo o site.",
          validade: "05/12/2025",
          desconto: "FRETE GRÁTIS",
          tag: "Popular",
        },
        {
          tituloHeader: "Cashback Futebol",
          codigo: "CASH10FC",
          titulo: "10% de cashback em camisas",
          descricao: "Compre camisas oficiais e receba 10% de volta em créditos.",
          validade: "20/12/2025",
          desconto: "10% CASHBACK",
        },
      ];
      novoCupom = exemplos[Math.floor(Math.random() * exemplos.length)];
    }

    // Adiciona cupom à lista e salva no localStorage
    novoCupom.id = Date.now();
    setCupons((prev) => {
      const atualizados = [novoCupom, ...prev].slice(0, 10);
      localStorage.setItem("cupons", JSON.stringify(atualizados));
      return atualizados;
    });
  };

  // 🕒 Carrega cupons e inicia intervalo de 2 horas
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("cupons")) || [];
    if (salvos.length === 0) {
      const iniciais = [
        {
          id: 1,
          tag: "Popular",
          tituloHeader: "Desconto de Boas-Vindas",
          codigo: "BEMVINDO20",
          titulo: "20% OFF na Primeira Compra",
          descricao: "Desconto especial para novos clientes. Válido para compras acima de R$ 50,00.",
          validade: "30/11/2025",
          desconto: "20% OFF",
        },
        {
          id: 2,
          tituloHeader: "Frete Grátis",
          codigo: "FRETEGRATIS",
          titulo: "Frete Grátis em Todo o Site",
          descricao: "Economize no frete em qualquer compra, independente do valor.",
          validade: "10/12/2025",
          desconto: "FRETE GRÁTIS",
        },
        {
          id: 3,
          tag: "Oferta",
          tituloHeader: "Super Desconto",
          codigo: "SUPER30",
          titulo: "30% OFF em camisas oficiais",
          descricao: "Aproveite o super desconto para renovar seu uniforme!",
          validade: "15/12/2025",
          desconto: "30% OFF",
        },
      ];
      setCupons(iniciais);
      localStorage.setItem("cupons", JSON.stringify(iniciais));
    } else {
      setCupons(salvos);
    }

    // Gera novo cupom a cada 2 horas
    const intervalo = setInterval(gerarCupom, 2 * 60 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  // 📋 Copiar código (sem alert)
  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <main className="cupons-container">
      <h1 className="cupons-title">Cupons de Desconto</h1>
      <p style={{ textAlign: "center", marginBottom: "30px", color: "#666" }}>
        Aproveite nossos cupons exclusivos e economize em suas compras!
      </p>

      <div className="cupons-grid">
        {cupons.map((cupom) => (
          <div key={cupom.id} className="cupom-card">
            {cupom.tag && <div className="cupom-tag">{cupom.tag}</div>}

            <div className="cupom-header">
              <h3>{cupom.tituloHeader}</h3>
              <div className="cupom-code">{cupom.codigo}</div>
            </div>

            <div className="cupom-body">
              <h4 className="cupom-title">{cupom.titulo}</h4>
              <p className="cupom-description">{cupom.descricao}</p>

              <div className="cupom-details">
                <span className="cupom-validity">Válido até: {cupom.validade}</span>
                <span className="cupom-discount">{cupom.desconto}</span>
              </div>

              <div className="cupom-actions">
                <button className="btn-copiar" onClick={() => copiarCodigo(cupom.codigo)}>
                  {copiado === cupom.codigo ? "Copiado!" : "Copiar Código"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cupom-info">
        <h3>Como usar os cupons</h3>
        <p>1. Escolha o cupom desejado e clique em "Copiar Código"</p>
        <p>
          2. No processo de finalização da compra, cole o código no campo "Cupom
          de Desconto"
        </p>
        <p>3. O desconto será aplicado automaticamente ao seu pedido</p>
      </div>
    </main>
  );
}
