import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PartnerDashboard() {
  const { user, isAuthenticated } = useAuth();

  // Get partner info for current user
  const { data: partnerInfo, isLoading: partnerLoading } = trpc.partner.me.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "partner",
  });

  // Get service orders for this partner
  const { data: serviceOrders, isLoading: ordersLoading } = trpc.serviceOrder.getByPartnerId.useQuery(
    partnerInfo?.id || 0,
    {
      enabled: isAuthenticated && user?.role === "partner" && !!partnerInfo?.id,
    }
  );

  // Get payments for this partner
  const { data: payments, isLoading: paymentsLoading } = trpc.serviceOrder.getPaymentsByPartnerId.useQuery(
    partnerInfo?.id || 0,
    {
      enabled: isAuthenticated && user?.role === "partner" && !!partnerInfo?.id,
    }
  );

  if (!isAuthenticated || user?.role !== "partner") {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Acesso negado. Apenas parceiros podem acessar este painel.</p>
        </div>
      </Layout>
    );
  }

  if (partnerLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Carregando dados do parceiro...</p>
        </div>
      </Layout>
    );
  }

  if (!partnerInfo) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Nenhum registro de parceiro encontrado para seu usuário.</p>
        </div>
      </Layout>
    );
  }

  const totalOrders = serviceOrders?.length || 0;
  const totalPayments = payments?.reduce((sum: number, p: any) => sum + (parseFloat(p.amount || "0")), 0) || 0;
  const totalHours = serviceOrders?.reduce((sum: number, o: any) => sum + (o.totalHours || 0), 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel de Parceiro</h1>
          <p className="text-foreground/60">Bem-vindo, {partnerInfo.companyName}</p>
        </div>

        {/* Partner Info Card */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <CardTitle>Informações do Parceiro</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Empresa</p>
                <p className="text-lg font-semibold">{partnerInfo.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">E-mail</p>
                <p className="text-lg font-semibold">{partnerInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Telefone</p>
                <p className="text-lg font-semibold">{partnerInfo.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Tipo de Pagamento</p>
                <Badge variant={partnerInfo.paymentType === "fixed" ? "default" : "secondary"}>
                  {partnerInfo.paymentType === "fixed" ? "Valor Fixo" : "Por Hora"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Valor de Pagamento</p>
                <p className="text-lg font-semibold">R$ {parseFloat(partnerInfo.paidValue || "0").toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Status</p>
                <Badge variant={partnerInfo.status === "active" ? "default" : "secondary"}>
                  {partnerInfo.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/60">Total de Ordens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/60">Total de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalHours.toFixed(1)}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/60">Total de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ {totalPayments.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Orders Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Minhas Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <p className="text-foreground/60">Carregando ordens...</p>
            ) : serviceOrders && serviceOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo de Serviço</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.osNumber}</TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{order.serviceType}</TableCell>
                        <TableCell>{order.totalHours?.toFixed(1) || "-"}h</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {order.status || "Pendente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-foreground/60">Nenhuma ordem de serviço encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <p className="text-foreground/60">Carregando pagamentos...</p>
            ) : payments && payments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("pt-BR") : "-"}
                        </TableCell>
                        <TableCell>R$ {parseFloat(payment.amount || "0").toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                            {payment.status === "paid" ? "Pago" : "Pendente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-foreground/60">Nenhum pagamento encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
