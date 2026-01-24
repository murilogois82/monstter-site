import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

export default function ServiceReports() {
  const [reportType, setReportType] = useState<"client" | "partner">("client");
  const [selectedId, setSelectedId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateClientReport = trpc.serviceReports.generateClientReport.useQuery(
    {
      clientId: parseInt(selectedId),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
    },
    {
      enabled: false,
    }
  );

  const generatePartnerReport = trpc.serviceReports.generatePartnerReport.useQuery(
    {
      partnerId: parseInt(selectedId),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
    },
    {
      enabled: false,
    }
  );

  const getClientsInPeriod = trpc.serviceReports.getClientsInPeriod.useQuery(
    {
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
    },
    {
      enabled: false,
    }
  );

  const handleGenerateReport = async () => {
    if (!selectedId || !periodStart || !periodEnd) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      if (reportType === "client") {
        const result = await generateClientReport.refetch();
        if (result.data) {
          setReport(result.data);
          toast.success("Relatório gerado com sucesso");
        }
      } else {
        const result = await generatePartnerReport.refetch();
        if (result.data) {
          setReport(result.data);
          toast.success("Relatório gerado com sucesso");
        }
      }
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;

    // Implementar exportação em PDF
    toast.info("Exportação em PDF será implementada em breve");
  };

  const handleLoadClients = async () => {
    if (!periodStart || !periodEnd) {
      toast.error("Selecione o período");
      return;
    }

    try {
      const result = await getClientsInPeriod.refetch();
      if (result.data) {
        toast.success(`${result.data.length} clientes encontrados`);
      }
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Relatórios de Prestação de Serviço</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="partner">Parceiro/Consultor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ID do {reportType === "client" ? "Cliente" : "Parceiro"}</Label>
                <Input
                  type="number"
                  placeholder="Digite o ID"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleGenerateReport} disabled={isLoading} className="flex-1">
                {isLoading ? "Gerando..." : "Gerar Relatório"}
              </Button>
              {reportType === "client" && (
                <Button onClick={handleLoadClients} variant="outline">
                  Carregar Clientes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {report && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Relatório de {reportType === "client" ? "Prestação de Serviço" : "Pagamento"}
                </CardTitle>
                <Button onClick={handleExportPDF} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {reportType === "client" ? "Cliente" : "Parceiro"}
                  </p>
                  <p className="font-semibold">
                    {reportType === "client" ? report.clientName : report.partnerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-semibold text-sm">{report.clientEmail || report.partnerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pagamento</p>
                  <p className="font-semibold">
                    {report.paymentType === "fixed" ? "Fixo" : "Por Hora"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-semibold">
                    R$ {parseFloat(report.chargedValue || report.paidValue).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Period Info */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="font-semibold">
                  {new Date(report.periodStart).toLocaleDateString("pt-BR")} a{" "}
                  {new Date(report.periodEnd).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Orders Table */}
              <div>
                <h3 className="font-semibold mb-4">Ordens de Serviço</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° OS</TableHead>
                        <TableHead>Tipo de Serviço</TableHead>
                        <TableHead>Data Início</TableHead>
                        <TableHead>Data Fim</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.orders.map((order: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">{order.osNumber}</TableCell>
                          <TableCell>{order.serviceType}</TableCell>
                          <TableCell>{order.startDate}</TableCell>
                          <TableCell>{order.endDate}</TableCell>
                          <TableCell className="text-right">{order.totalHours}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary/10 p-6 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Horas</p>
                    <p className="text-2xl font-bold">{report.totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-primary">R$ {parseFloat(report.totalAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gerado em</p>
                    <p className="text-sm font-semibold">
                      {new Date(report.generatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
