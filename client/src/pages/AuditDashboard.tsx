import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  Shield,
  LogOut,
  LogIn,
  UserCog,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data - em produção virá da API
const mockAuditLogs = [
  {
    id: 1,
    userId: 1,
    userName: "Admin User",
    actionType: "PERMISSION_CHANGE",
    targetUserId: 5,
    targetUserName: "João Silva",
    oldValues: { role: "user" },
    newValues: { role: "partner" },
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    userId: 1,
    userName: "Admin User",
    actionType: "ACCESS_DENIED",
    targetUserId: 3,
    targetUserName: "Maria Santos",
    status: "FAILED",
    errorMessage: "Acesso negado - usuário não é admin",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 3,
    userId: 2,
    userName: "Manager User",
    actionType: "LOGIN",
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 4,
    userId: 1,
    userName: "Admin User",
    actionType: "PERMISSION_CHANGE",
    targetUserId: 4,
    targetUserName: "Pedro Costa",
    oldValues: { role: "partner" },
    newValues: { role: "manager" },
    status: "SUCCESS",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: 5,
    userId: 3,
    userName: "Regular User",
    actionType: "ACCESS_DENIED",
    targetUserId: 2,
    targetUserName: "Manager User",
    status: "FAILED",
    errorMessage: "Acesso negado - usuário não é admin",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
  },
];

const ACTION_ICONS: Record<string, React.ReactNode> = {
  PERMISSION_CHANGE: <UserCog className="w-4 h-4" />,
  LOGIN: <LogIn className="w-4 h-4" />,
  LOGOUT: <LogOut className="w-4 h-4" />,
  ACCESS_DENIED: <AlertCircle className="w-4 h-4" />,
  CREATE: <Shield className="w-4 h-4" />,
  UPDATE: <UserCog className="w-4 h-4" />,
  DELETE: <AlertCircle className="w-4 h-4" />,
};

const ACTION_LABELS: Record<string, string> = {
  PERMISSION_CHANGE: "Alteração de Permissão",
  LOGIN: "Login",
  LOGOUT: "Logout",
  ACCESS_DENIED: "Acesso Negado",
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Exclusão",
};

export default function AuditDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");

  // Filtrar logs baseado nos critérios
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      // Filtro de busca
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        log.userName.toLowerCase().includes(searchLower) ||
        log.targetUserName?.toLowerCase().includes(searchLower) ||
        log.actionType.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filtro de ação
      if (actionFilter !== "all" && log.actionType !== actionFilter) {
        return false;
      }

      // Filtro de status
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // Filtro de data
      const now = new Date();
      const logDate = new Date(log.createdAt);

      if (dateRange === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return logDate >= today && logDate < tomorrow;
      } else if (dateRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return logDate >= monthAgo;
      }

      return true;
    });
  }, [searchTerm, actionFilter, statusFilter, dateRange]);

  const handleExport = () => {
    // Preparar dados para CSV
    const headers = [
      "Data/Hora",
      "Usuário",
      "Ação",
      "Usuário Alvo",
      "Status",
      "Detalhes",
    ];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      log.userName,
      ACTION_LABELS[log.actionType] || log.actionType,
      log.targetUserName || "-",
      log.status,
      log.errorMessage || JSON.stringify(log.newValues || {}),
    ]);

    // Criar CSV
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `auditoria-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const successCount = filteredLogs.filter((l) => l.status === "SUCCESS").length;
  const failedCount = filteredLogs.filter((l) => l.status === "FAILED").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Painel de Auditoria</h1>
          <p className="text-slate-400">
            Acompanhe todas as alterações de permissões e acessos dos usuários
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Eventos</p>
                  <p className="text-3xl font-bold text-white">
                    {filteredLogs.length}
                  </p>
                </div>
                <Shield className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Operações Bem-sucedidas</p>
                  <p className="text-3xl font-bold text-green-400">{successCount}</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Operações Falhadas</p>
                  <p className="text-3xl font-bold text-red-400">{failedCount}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar por usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Action Filter */}
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Tipo de Ação" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  <SelectItem value="PERMISSION_CHANGE">
                    Alteração de Permissão
                  </SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="ACCESS_DENIED">Acesso Negado</SelectItem>
                  <SelectItem value="CREATE">Criação</SelectItem>
                  <SelectItem value="UPDATE">Atualização</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="SUCCESS">Bem-sucedido</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Audit Logs Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Registro de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300">Data/Hora</TableHead>
                    <TableHead className="text-slate-300">Usuário</TableHead>
                    <TableHead className="text-slate-300">Ação</TableHead>
                    <TableHead className="text-slate-300">Usuário Alvo</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-slate-700 hover:bg-slate-700/50"
                      >
                        <TableCell className="text-slate-300 text-sm">
                          {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-slate-300">{log.userName}</TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            {ACTION_ICONS[log.actionType]}
                            <span>{ACTION_LABELS[log.actionType] || log.actionType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {log.targetUserName || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "SUCCESS" ? "default" : "destructive"
                            }
                            className={
                              log.status === "SUCCESS"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                          >
                            {log.status === "SUCCESS" ? "✓ Sucesso" : "✗ Falhou"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {log.errorMessage ? (
                            <span className="text-red-400">{log.errorMessage}</span>
                          ) : log.newValues ? (
                            <span className="text-green-400">
                              {JSON.stringify(log.newValues)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                        Nenhum evento encontrado com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
