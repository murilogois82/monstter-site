import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PartnerServiceOrders() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("");

  const { data: orders, isLoading, refetch } = trpc.serviceOrder.listMine.useQuery();
  const sendOSMutation = trpc.serviceOrder.send.useMutation();

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Rascunho", variant: "secondary" },
      sent: { label: "Enviada", variant: "default" },
      in_progress: { label: "Em Progresso", variant: "outline" },
      completed: { label: "Concluída", variant: "default" },
      closed: { label: "Encerrada", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSendOS = async (osId: number) => {
    try {
      await sendOSMutation.mutateAsync(osId);
      toast.success("Ordem de Serviço enviada com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao enviar a Ordem de Serviço");
      console.error(error);
    }
  };

  const filteredOrders = orders?.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesDate = !dateFilter || new Date(order.startDateTime).toISOString().split("T")[0] === dateFilter;
    const matchesClient = !clientFilter || order.clientName.toLowerCase().includes(clientFilter.toLowerCase());
    return matchesStatus && matchesDate && matchesClient;
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Minhas Ordens de Serviço</CardTitle>
                <p className="text-red-100 mt-2">Gerencie suas ordens de serviço</p>
              </div>
              <Button
                onClick={() => setLocation("/service-order-form")}
                className="bg-white text-red-600 hover:bg-red-50"
              >
                + Nova OS
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="closed">Encerrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data
                </label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filtrar por data"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cliente
                </label>
                <Input
                  type="text"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  placeholder="Buscar por cliente"
                />
              </div>
            </div>

            {/* Tabela de Ordens de Serviço */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">Carregando ordens de serviço...</p>
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo de Serviço</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Total Horas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.osNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{order.serviceType}</TableCell>
                        <TableCell>
                          {new Date(order.startDateTime).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{order.totalHours ? `${order.totalHours}h` : "-"}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {order.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() => handleSendOS(order.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Enviar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/service-order/${order.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-foreground/70 mb-4">
                  {statusFilter !== "all" || dateFilter || clientFilter
                    ? "Nenhuma ordem de serviço encontrada com os filtros aplicados."
                    : "Você ainda não criou nenhuma ordem de serviço."}
                </p>
                <Button
                  onClick={() => setLocation("/service-order-form")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Criar Primeira OS
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
