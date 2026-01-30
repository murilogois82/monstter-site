import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";

export function PartnerControlPanel() {
  const { data: stats, isLoading, error } = trpc.partner.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="pt-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600">Erro ao carregar estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  const statusData = [
    { name: "Concluídas", value: stats.completedOrders, color: "#10b981" },
    { name: "Em Progresso", value: stats.inProgressOrders, color: "#f59e0b" },
    { name: "Rascunho", value: stats.draftOrders, color: "#6b7280" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Ordens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-2">Ordens de serviço criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4" />
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completionRate}%</div>
            <p className="text-xs text-gray-500 mt-2">{stats.completedOrders} de {stats.totalOrders} concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              Total de Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-gray-500 mt-2">Média: {stats.averageHours}h por ordem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">R$ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-2">{stats.paymentType === "fixed" ? "Pagamento Fixo" : "Pagamento por Hora"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              Valor {stats.paymentType === "fixed" ? "Fixo" : "Hora"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">R$ {stats.paymentValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-2">Por {stats.paymentType === "fixed" ? "ordem" : "hora"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Ordens Concluídas</span>
                  <span className="font-semibold">{stats.completedOrders}/{stats.totalOrders}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Ordens em Progresso</span>
                  <span className="font-semibold">{stats.inProgressOrders}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalOrders > 0 ? (stats.inProgressOrders / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Rascunhos</span>
                  <span className="font-semibold">{stats.draftOrders}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalOrders > 0 ? (stats.draftOrders / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receita estimada: <span className="font-bold text-blue-600">R$ {stats.totalRevenue.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
