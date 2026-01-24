import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Clock, Users } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FinancialDashboard() {
  const [periodStart, setPeriodStart] = useState<Date>(subMonths(new Date(), 1));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch financial metrics
  const metricsQuery = trpc.financialMetrics.getMetrics.useQuery({
    periodStart,
    periodEnd,
  });

  // Fetch monthly comparison
  const monthlyQuery = trpc.financialMetrics.getMonthlyComparison.useQuery({
    year: selectedYear,
  });

  // Fetch consultant metrics
  const consultantQuery = trpc.financialMetrics.getConsultantMetrics.useQuery({
    periodStart,
    periodEnd,
  });

  // Fetch utilization rate
  const utilizationQuery = trpc.financialMetrics.getUtilizationRate.useQuery({
    periodStart,
    periodEnd,
  });

  const metrics = metricsQuery.data;
  const monthlyData = monthlyQuery.data || [];
  const consultantData = consultantQuery.data || [];
  const utilization = utilizationQuery.data;

  // Prepare pie chart data for profit distribution
  const profitData = useMemo(() => {
    if (!metrics) return [];
    const revenue = parseFloat(metrics.totalRevenue);
    const cost = parseFloat(metrics.totalCost);
    return [
      { name: "Receita", value: revenue },
      { name: "Custo", value: cost },
    ];
  }, [metrics]);

  const COLORS = ["#ef4444", "#10b981"];

  const isLoading = metricsQuery.isLoading || monthlyQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Financeiro</h1>
          <p className="text-gray-400">Análise completa de receita, custos e lucratividade</p>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Inicial</label>
            <input
              type="date"
              value={format(periodStart, "yyyy-MM-dd")}
              onChange={(e) => setPeriodStart(new Date(e.target.value))}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Final</label>
            <input
              type="date"
              value={format(periodEnd, "yyyy-MM-dd")}
              onChange={(e) => setPeriodEnd(new Date(e.target.value))}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ano (Comparativo)</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min={2020}
              max={2100}
              className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 w-32"
            />
          </div>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ {metrics.totalRevenue}</div>
                <p className="text-xs text-gray-500 mt-1">{metrics.completedOrders} ordens fechadas</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Lucro Bruto</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ {metrics.grossProfit}</div>
                <p className="text-xs text-gray-500 mt-1">Margem: {metrics.profitMargin}%</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Horas Faturáveis</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{metrics.totalBillableHours}</div>
                <p className="text-xs text-gray-500 mt-1">Valor/hora: R$ {metrics.averageHourlyRate}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Taxa Utilização</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{utilization?.utilizationRate || "0"}%</div>
                <p className="text-xs text-gray-500 mt-1">{utilization?.billableHours || 0} de {utilization?.totalAvailableHours || 0} horas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Comparison Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Comparativo Mensal - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ef4444" name="Receita" />
                  <Bar dataKey="cost" fill="#f97316" name="Custo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Distribution */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição Receita vs Custo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={profitData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {profitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => `R$ ${typeof value === 'number' ? value.toFixed(2) : value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Profit Trend */}
        {monthlyData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Evolução do Lucro Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" name="Lucro" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Consultant Metrics Table */}
        {consultantData.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Desempenho por Consultor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4">Consultor</th>
                      <th className="text-right py-3 px-4">Horas</th>
                      <th className="text-right py-3 px-4">Ganhos</th>
                      <th className="text-right py-3 px-4">Ordens</th>
                      <th className="text-right py-3 px-4">Valor Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultantData.map((consultant) => (
                      <tr key={consultant.consultantId} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4">{consultant.consultantName}</td>
                        <td className="text-right py-3 px-4">{consultant.totalHours}</td>
                        <td className="text-right py-3 px-4 text-green-400">R$ {consultant.totalEarnings}</td>
                        <td className="text-right py-3 px-4">{consultant.ordersCompleted}</td>
                        <td className="text-right py-3 px-4">R$ {consultant.averageOrderValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
