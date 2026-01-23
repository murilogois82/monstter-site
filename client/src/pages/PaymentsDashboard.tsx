import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function PaymentsDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders, isLoading: ordersLoading } = trpc.serviceOrder.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const { data: partners, isLoading: partnersLoading } = trpc.partner.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              Você precisa estar autenticado para acessar esta página.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ordersLoading || partnersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/70">Carregando dashboard...</p>
      </div>
    );
  }

  // Calcular métricas
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed" || o.status === "closed").length || 0;
  const totalHours = orders?.reduce((acc, order) => acc + (parseFloat(order.totalHours || "0") || 0), 0) || 0;
  const averageHoursPerDay = totalOrders > 0 ? (totalHours / totalOrders).toFixed(2) : "0";

  // Calcular receita total (assumindo R$ 150/hora como exemplo)
  const hourlyRate = 150;
  const totalRevenue = totalHours * hourlyRate;

  // Pagamentos pendentes (ordens concluídas mas não pagas)
  const pendingPayments = orders?.filter((o) => o.status === "completed").length || 0;
  const pendingRevenue = orders
    ?.filter((o) => o.status === "completed")
    .reduce((acc, order) => acc + (parseFloat(order.totalHours || "0") || 0) * hourlyRate, 0) || 0;

  // Dados para gráfico de horas por consultor
  const partnerHoursMap = new Map<number, { name: string; hours: number }>();
  
  orders?.forEach((order) => {
    const hours = parseFloat(order.totalHours || "0") || 0;
    if (partnerHoursMap.has(order.partnerId)) {
      const existing = partnerHoursMap.get(order.partnerId)!;
      existing.hours += hours;
    } else {
      const partner = partners?.find((p) => p.id === order.partnerId);
      partnerHoursMap.set(order.partnerId, {
        name: partner?.companyName || `Parceiro ${order.partnerId}`,
        hours,
      });
    }
  });

  const partnerHoursData = Array.from(partnerHoursMap.values()).map((item) => ({
    name: item.name,
    horas: parseFloat(item.hours.toFixed(2)),
    receita: parseFloat((item.hours * hourlyRate).toFixed(2)),
  }));

  // Dados para gráfico de status
  const statusData = [
    { name: "Rascunho", value: orders?.filter((o) => o.status === "draft").length || 0 },
    { name: "Enviada", value: orders?.filter((o) => o.status === "sent").length || 0 },
    { name: "Em Progresso", value: orders?.filter((o) => o.status === "in_progress").length || 0 },
    { name: "Concluída", value: orders?.filter((o) => o.status === "completed").length || 0 },
    { name: "Encerrada", value: orders?.filter((o) => o.status === "closed").length || 0 },
  ].filter((item) => item.value > 0);

  const COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  // Dados para gráfico de evolução mensal
  const monthlyData = new Map<string, { month: string; orders: number; hours: number }>();
  
  orders?.forEach((order) => {
    const date = new Date(order.startDateTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("pt-BR", { year: "numeric", month: "short" });
    
    if (monthlyData.has(monthKey)) {
      const existing = monthlyData.get(monthKey)!;
      existing.orders += 1;
      existing.hours += parseFloat(order.totalHours || "0") || 0;
    } else {
      monthlyData.set(monthKey, {
        month: monthLabel,
        orders: 1,
        hours: parseFloat(order.totalHours || "0") || 0,
      });
    }
  });

  const monthlyChartData = Array.from(monthlyData.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      mes: item.month,
      ordens: item.orders,
      horas: parseFloat(item.hours.toFixed(2)),
    }));

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Pagamentos</h1>
          <p className="text-foreground/70">Visão geral de receitas, horas trabalhadas e pagamentos</p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Total de Ordens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
              <p className="text-sm text-foreground/60 mt-1">{completedOrders} concluídas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Total de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalHours.toFixed(2)}h</p>
              <p className="text-sm text-foreground/60 mt-1">Média: {averageHoursPerDay}h/dia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Receita Gerada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-foreground/60 mt-1">R$ {hourlyRate}/hora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">
                R$ {pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-foreground/60 mt-1">{pendingPayments} ordens</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Horas por Consultor */}
          <Card>
            <CardHeader>
              <CardTitle>Horas por Consultor</CardTitle>
            </CardHeader>
            <CardContent>
              {partnerHoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={partnerHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas" fill="#dc2626" name="Horas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="ordens" stroke="#3b82f6" name="Ordens" />
                  <Line yAxisId="right" type="monotone" dataKey="horas" stroke="#dc2626" name="Horas" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Receita por Consultor */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Receita por Consultor</CardTitle>
          </CardHeader>
          <CardContent>
            {partnerHoursData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Consultor</th>
                      <th className="text-right py-3 px-4">Horas Trabalhadas</th>
                      <th className="text-right py-3 px-4">Receita Gerada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerHoursData.map((partner, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{partner.name}</td>
                        <td className="text-right py-3 px-4">{partner.horas}h</td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          R$ {partner.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td className="py-3 px-4">Total</td>
                      <td className="text-right py-3 px-4">{totalHours.toFixed(2)}h</td>
                      <td className="text-right py-3 px-4 text-green-600">
                        R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
