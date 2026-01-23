import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminServiceOrders() {
  const { user, isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [paymentData, setPaymentData] = useState({
    osId: 0,
    amount: "",
    paymentStatus: "pending" as const,
    paymentDate: "",
    notes: "",
  });

  // Queries
  const { data: allOrders = [], isLoading: loadingOrders, refetch } = trpc.serviceOrder.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const closeOSMutation = trpc.serviceOrder.close.useMutation();

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "manager")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              Apenas gestores e administradores podem acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredOrders = selectedStatus === "all" 
    ? allOrders 
    : allOrders.filter(order => order.status === selectedStatus);

  const handleCloseOrder = async () => {
    if (!paymentData.osId) {
      toast.error("Selecione uma ordem de serviço");
      return;
    }

    try {
      await closeOSMutation.mutateAsync({
        id: paymentData.osId,
        paymentAmount: paymentData.amount ? parseFloat(paymentData.amount) : undefined,
        paymentStatus: paymentData.paymentStatus,
        paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate) : undefined,
        notes: paymentData.notes,
      });

      toast.success("Ordem de Serviço encerrada com sucesso!");
      setPaymentData({
        osId: 0,
        amount: "",
        paymentStatus: "pending",
        paymentDate: "",
        notes: "",
      });
      refetch();
    } catch (error) {
      toast.error("Erro ao encerrar a Ordem de Serviço");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      draft: { label: "Rascunho", variant: "secondary" },
      sent: { label: "Enviada", variant: "default" },
      in_progress: { label: "Em Progresso", variant: "outline" },
      completed: { label: "Concluída", variant: "secondary" },
      closed: { label: "Encerrada", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const summaryByConsultant = allOrders.reduce((acc, order) => {
    const key = order.partnerId;
    if (!acc[key]) {
      acc[key] = { count: 0, totalHours: 0 };
    }
    acc[key].count += 1;
    acc[key].totalHours += order.totalHours ? parseFloat(order.totalHours as any) : 0;
    return acc;
  }, {} as Record<number, { count: number; totalHours: number }>);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel de Gestão de OS</h1>
          <p className="text-foreground/70">Gerencie todas as ordens de serviço e pagamentos</p>
        </div>

        {/* Resumo por Consultor */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Consultor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(summaryByConsultant).map(([partnerId, data]) => (
                <div key={partnerId} className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-foreground/70">Consultor ID: {partnerId}</p>
                  <p className="text-2xl font-bold text-red-600">{data.count} OS</p>
                  <p className="text-sm text-foreground/70 mt-2">{data.totalHours} horas totais</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as OS</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="closed">Encerrada</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tabela de OS */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <p className="text-foreground/70">Carregando...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-foreground/70">Nenhuma ordem de serviço encontrada</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo de Serviço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.osNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{order.serviceType}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.totalHours ? `${order.totalHours}h` : "-"}</TableCell>
                        <TableCell>
                          {new Date(order.startDateTime).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPaymentData({ ...paymentData, osId: order.id })}
                                disabled={order.status === "closed"}
                              >
                                Encerrar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Encerrar Ordem de Serviço</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Valor do Pagamento
                                  </label>
                                  <Input
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={(e) =>
                                      setPaymentData({ ...paymentData, amount: e.target.value })
                                    }
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Status do Pagamento
                                  </label>
                                  <Select
                                    value={paymentData.paymentStatus}
                                    onValueChange={(value) =>
                                      setPaymentData({
                                        ...paymentData,
                                        paymentStatus: value as any,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pendente</SelectItem>
                                      <SelectItem value="scheduled">Agendado</SelectItem>
                                      <SelectItem value="completed">Concluído</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Data do Pagamento
                                  </label>
                                  <Input
                                    type="date"
                                    value={paymentData.paymentDate}
                                    onChange={(e) =>
                                      setPaymentData({
                                        ...paymentData,
                                        paymentDate: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-2">
                                    Observações
                                  </label>
                                  <Input
                                    type="text"
                                    value={paymentData.notes}
                                    onChange={(e) =>
                                      setPaymentData({ ...paymentData, notes: e.target.value })
                                    }
                                    placeholder="Adicione observações sobre o pagamento"
                                  />
                                </div>
                                <Button
                                  onClick={handleCloseOrder}
                                  className="w-full bg-red-600 hover:bg-red-700"
                                  disabled={closeOSMutation.isPending}
                                >
                                  {closeOSMutation.isPending ? "Encerrando..." : "Encerrar OS"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
