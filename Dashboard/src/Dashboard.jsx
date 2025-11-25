import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./Dashboard.css";

// --- Componentes Auxiliares ---

function Loading() {
  return (
    <div className="dashboard loading">
      <div className="loading-spinner">Carregando dados do sistema...</div>
    </div>
  );
}

// Componente Sidebar
function Sidebar({ activePage, onPageChange }) {
  const menuItems = [
    { key: "dashboard", icon: "📊", text: "Dashboard" },
    { key: "aprovacoes", icon: "✅", text: "Aprovações" },
    { key: "pedidos", icon: "📋", text: "Pedidos" },
    { key: "produtos", icon: "🛒", text: "Produtos" },
    { key: "clientes", icon: "👥", text: "Clientes" },
    { key: "relatorios", icon: "📈", text: "Relatórios" }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>SoccerGear Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.key}>
              <div 
                className={`nav-item ${activePage === item.key ? 'active' : ''}`}
                onClick={() => onPageChange(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// Componente Header (Integrado com Usuário Logado)
function Header({ title, subtitle, usuario }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-right">
        <div className="user-info">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>
              {usuario ? usuario.name : "Administrador"}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>
              {usuario ? `ID: ${usuario.id}` : ""}
            </span>
          </div>
          <div className="user-avatar">
            {usuario && usuario.name ? usuario.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}

// Componente Metrics Cards
function MetricsCards({ dashboardData }) {
  const metrics = [
    {
      key: "revenue",
      title: "Receita Total",
      value: `R$ ${dashboardData.lucro.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: "💰"
    },
    {
      key: "sales",
      title: "Vendas Aprovadas",
      value: dashboardData.vendas,
      icon: "📦"
    },
    {
      key: "orders",
      title: "Pedidos Pendentes", // Ajustado título para fazer sentido
      value: dashboardData.pendentes, // Usa pendentes em vez de total
      icon: "⏳"
    },
    {
      key: "customers",
      title: "Total Clientes",
      value: dashboardData.clientes,
      icon: "👥"
    }
  ];

  return (
    <section className="metrics">
      {metrics.map((metric) => (
        <div key={metric.key} className={`metric-card ${metric.key}`}>
          <div className="metric-icon">{metric.icon}</div>
          <div className="metric-info">
            <h3>{metric.title}</h3>
            <p className="metric-value">{metric.value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// Componente Orders List
function OrdersList({ pedidos, atualizarStatus, showActions = true }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      aguardando: { class: "status-pending", text: "Pendente" },
      aprovado: { class: "status-approved", text: "Aprovado" },
      rejeitado: { class: "status-rejected", text: "Rejeitado" }
    };
    
    const statusInfo = statusMap[status] || { class: "status-pending", text: status };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <section className="orders-list">
      <h3>{showActions ? "Todos os Pedidos" : "Pedidos Recentes"}</h3>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Total</th>
              <th>Método</th>
              <th>Status</th>
              {showActions && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>#{pedido.id}</td>
                <td>{pedido.cliente?.name || "Usuário Removido"}</td>
                <td>{pedido.cliente?.email || "-"}</td>
                <td>R$ {Number(pedido.total).toFixed(2)}</td>
                <td>{pedido.metodo}</td>
                <td>{getStatusBadge(pedido.status)}</td>
                {showActions && (
                  <td>
                    {pedido.status === "aguardando" ? (
                      <>
                        <button
                          className="btn-aprovar"
                          onClick={() => atualizarStatus(pedido.id, "aprovar")}
                          title="Aprovar e dar pontos"
                        >
                          ✓
                        </button>
                        <button
                          className="btn-rejeitar"
                          onClick={() => atualizarStatus(pedido.id, "rejeitar")}
                          title="Rejeitar"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="status-text">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// Componente Line Chart com Recharts
function LineChartRecharts({ data, title }) {
  return (
    <div className="chart-container line-chart large-chart">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div className="chart-content">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(v) => `R$ ${v.toLocaleString()}`} 
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${value.toLocaleString()}`, "Vendas"]}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: "#1d4ed8", stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>Aguardando vendas aprovadas para gerar o gráfico.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Time Filter (Mantido visualmente)
function TimeFilter({ timeFilter, setTimeFilter, position = "header" }) {
  return (
    <div className={`time-filter ${position}`}>
      <button className={`time-filter-btn ${timeFilter === 'week' ? 'active' : ''}`} onClick={() => setTimeFilter('week')}>Semana</button>
      <button className={`time-filter-btn ${timeFilter === 'month' ? 'active' : ''}`} onClick={() => setTimeFilter('month')}>Mês</button>
      <button className={`time-filter-btn ${timeFilter === 'year' ? 'active' : ''}`} onClick={() => setTimeFilter('year')}>Ano</button>
    </div>
  );
}

// --- PÁGINAS DO DASHBOARD ---

function DashboardPage({ dashboardData, pedidos, atualizarStatus, loading, vendasGrafico, usuario }) {
  const [timeFilter, setTimeFilter] = useState('month');
  const dailySalesData = vendasGrafico.slice(-7); // Últimos 7 dias para o widget

  if (loading) return <div className="loading">Carregando dados...</div>;

  return (
    <div className="main">
      <Header title="Dashboard" subtitle="Visão geral do desempenho" usuario={usuario} />
      <MetricsCards dashboardData={dashboardData} />
      
      <div className="main-chart-section">
        <div className="chart-main">
          {/* Gráfico conectado ao Backend */}
          <LineChartRecharts data={vendasGrafico} title="Evolução das Vendas" />
        </div>
        
        <div className="chart-sidebar">
          <TimeFilter timeFilter={timeFilter} setTimeFilter={setTimeFilter} position="sidebar" />
          
          <div className="daily-sales-widget">
            <h4>Vendas Recentes</h4>
            {dailySalesData.length > 0 ? (
              <div className="daily-sales-list">
                {dailySalesData.map((day, index) => (
                  <div key={index} className="daily-sale-item">
                    <div className="daily-sale-info"><span className="daily-sale-date">{day.label}</span></div>
                    <span className="daily-sale-value">R$ {day.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : <div className="no-data-small"><p>Sem dados recentes</p></div>}
          </div>

          <div className="quick-stats">
            <h4>Resumo Financeiro</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Geral</span>
                <span className="stat-value">{`R$ ${dashboardData.lucro.toLocaleString()}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrdersList pedidos={pedidos.slice(0, 5)} atualizarStatus={atualizarStatus} showActions={false} />
    </div>
  );
}

function AprovacoesPage({ pedidos, atualizarStatus, loading, usuario }) {
  const pedidosPendentes = pedidos.filter(pedido => pedido.status === "aguardando");

  if (loading) return <div className="loading">Carregando dados...</div>;

  return (
    <div className="main">
      <Header title="Aprovações de Pedidos" subtitle="Gerencie pedidos pendentes" usuario={usuario} />
      
      <div className="page-content">
        <div className="content-header">
          <h3>Pedidos Pendentes ({pedidosPendentes.length})</h3>
        </div>

        {pedidosPendentes.length === 0 ? (
          <div className="empty-state">
            <h4> Nenhum pedido pendente!</h4>
            <p>Todos os pedidos foram processados.</p>
          </div>
        ) : (
          <div className="approval-grid">
            {pedidosPendentes.map(pedido => (
              <div key={pedido.id} className="approval-card">
                <div className="approval-card-header">
                  <div className="order-info">
                    <h4>Pedido #{pedido.id}</h4>
                    <span className="order-date">
                      {new Date(pedido.data || pedido.createdAt || new Date()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="order-total">R$ {Number(pedido.total).toFixed(2)}</div>
                </div>

                <div className="approval-card-body">
                  <div className="customer-info">
                    <strong>Cliente:</strong> {pedido.cliente?.name || "Desconhecido"}
                  </div>
                  <div className="payment-info"><strong>Método:</strong> {pedido.metodo}</div>
                  
                  {/* Exibição Segura de Itens */}
                  {(Array.isArray(pedido.itens) ? pedido.itens : JSON.parse(pedido.itens || "[]")).length > 0 && (
                    <div className="order-items">
                      <strong>Itens:</strong>
                      <div className="items-list">
                        {(Array.isArray(pedido.itens) ? pedido.itens : JSON.parse(pedido.itens || "[]")).map((item, index) => (
                          <div key={index} className="item">
                            <span>{item.quantity || 1}x {item.nome || item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="approval-card-footer">
                  <button className="btn-rejeitar large" onClick={() => {
                      if (window.confirm('Rejeitar pedido?')) atualizarStatus(pedido.id, "rejeitar");
                  }}>Rejeitar</button>
                  <button className="btn-aprovar large" onClick={() => {
                      if (window.confirm('Aprovar pedido?')) atualizarStatus(pedido.id, "aprovar");
                  }}>Aprovar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PedidosPage({ pedidos, atualizarStatus, usuario }) {
  return (
    <div className="main">
      <Header title="Gestão de Pedidos" subtitle="Histórico completo" usuario={usuario} />
      <OrdersList pedidos={pedidos} atualizarStatus={atualizarStatus} showActions={true} />
    </div>
  );
}

function ProdutosPage({ usuario }) {
  return (
    <div className="main">
      <Header title="Produtos" subtitle="Catálogo" usuario={usuario} />
      <div className="page-content"><p>Funcionalidade de produtos em desenvolvimento...</p></div>
    </div>
  );
}

function ClientesPage({ clientes, usuario }) {
  return (
    <div className="main">
      <Header title="Gestão de Clientes" subtitle="Base de usuários" usuario={usuario} />
      <div className="page-content">
        <div className="content-header"><h3>Lista de Clientes ({clientes.length})</h3></div>
        <div className="clients-table">
          <table>
            <thead>
              <tr><th>ID</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Pontos</th></tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? clientes.map(client => (
                <tr key={client.id}>
                  <td>#{client.id}</td>
                  <td><strong>{client.name}</strong></td>
                  <td>{client.email}</td>
                  <td>{client.telefone || "-"}</td>
                  <td><span className="stock-badge good">{client.pontos} pts</span></td>
                </tr>
              )) : <tr><td colSpan="5" style={{textAlign: "center"}}>Nenhum cliente encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RelatoriosPage({ vendasGrafico, usuario }) {
  return (
    <div className="main">
      <Header title="Relatórios" subtitle="Análise" usuario={usuario} />
      <div className="main-chart-section">
        <div className="chart-main">
          <LineChartRecharts data={vendasGrafico} title="Histórico Completo" />
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [usuarioAdmin, setUsuarioAdmin] = useState(null);
  
  // Estados de Dados
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [dashboardData, setDashboardData] = useState({ vendas: 0, lucro: 0, pendentes: 0, clientes: 0 });
  const [vendasGrafico, setVendasGrafico] = useState([]);

  // 1. Carregar dados do Backend (Conecta com seu server.js e banco de dados)
  const carregarDadosDashboard = async () => {
    try {
      // Busca simultânea para performance
      const [resPedidos, resGrafico, resClientes] = await Promise.all([
        fetch("http://localhost:3001/api/pedidos"),
        fetch("http://localhost:3001/api/dashboard/chart"),
        fetch("http://localhost:3001/api/clientes")
      ]);

      const dadosPedidos = await resPedidos.json();
      const dadosGrafico = await resGrafico.json();
      const dadosClientes = await resClientes.json();

      if (Array.isArray(dadosPedidos)) {
        setPedidos(dadosPedidos);
        
        // Garante arrays vazios se falhar
        setVendasGrafico(Array.isArray(dadosGrafico) ? dadosGrafico : []);
        setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);

        // Calcula métricas locais
        const aprovados = dadosPedidos.filter(p => p.status === "aprovado");
        const pendentes = dadosPedidos.filter(p => p.status === "aguardando");
        const totalReceita = aprovados.reduce((acc, p) => acc + Number(p.total), 0);

        setDashboardData({
          lucro: totalReceita,
          vendas: aprovados.length,
          pendentes: pendentes.length,
          clientes: Array.isArray(dadosClientes) ? dadosClientes.length : 0
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro de conexão com API:", error);
      setLoading(false);
    }
  };

  // 2. Atualizar Status (Aprovar/Rejeitar)
  const atualizarStatus = async (id, acao) => {
    try {
      const res = await fetch(`http://localhost:3001/api/pedido/${acao}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (res.ok && data.sucesso) {
        alert(`Pedido #${id} atualizado com sucesso!`);
        carregarDadosDashboard(); // Recarrega para atualizar gráfico e listas
      } else {
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro de conexão com o servidor.");
    }
  };

  // Inicialização
  useEffect(() => {
    // Carrega usuário do localStorage
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
        try {
            setUsuarioAdmin(JSON.parse(usuarioSalvo));
        } catch (e) { console.error(e); }
    }
    
    carregarDadosDashboard();
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage dashboardData={dashboardData} pedidos={pedidos} atualizarStatus={atualizarStatus} loading={loading} vendasGrafico={vendasGrafico} usuario={usuarioAdmin} />;
      case "aprovacoes": return <AprovacoesPage pedidos={pedidos} atualizarStatus={atualizarStatus} loading={loading} usuario={usuarioAdmin} />;
      case "pedidos": return <PedidosPage pedidos={pedidos} atualizarStatus={atualizarStatus} usuario={usuarioAdmin} />;
      case "produtos": return <ProdutosPage usuario={usuarioAdmin} />;
      case "clientes": return <ClientesPage clientes={clientes} usuario={usuarioAdmin} />;
      case "relatorios": return <RelatoriosPage vendasGrafico={vendasGrafico} usuario={usuarioAdmin} />;
      default: return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dashboard">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      {renderPage()}
    </div>
  );
}