import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ServiceOrderForm() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    osNumber: "",
    clientName: "",
    clientEmail: "",
    serviceType: "",
    startDateTime: "",
    interval: "",
    endDateTime: "",
    description: "",
  });

  const createOSMutation = trpc.serviceOrder.create.useMutation();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalHours = () => {
    if (!formData.startDateTime || !formData.endDateTime) return 0;
    
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const totalHours = calculateTotalHours();
      
      await createOSMutation.mutateAsync({
        osNumber: formData.osNumber,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        serviceType: formData.serviceType,
        startDateTime: new Date(formData.startDateTime),
        interval: formData.interval ? parseInt(formData.interval) : undefined,
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime) : undefined,
        totalHours: totalHours > 0 ? totalHours : undefined,
        description: formData.description,
      });

      toast.success("Ordem de Serviço salva com sucesso!");
      setFormData({
        osNumber: "",
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startDateTime: "",
        interval: "",
        endDateTime: "",
        description: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar a Ordem de Serviço");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const totalHours = calculateTotalHours();
      
      const result = await createOSMutation.mutateAsync({
        osNumber: formData.osNumber,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        serviceType: formData.serviceType,
        startDateTime: new Date(formData.startDateTime),
        interval: formData.interval ? parseInt(formData.interval) : undefined,
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime) : undefined,
        totalHours: totalHours > 0 ? totalHours : undefined,
        description: formData.description,
      });

      // TODO: Integrar envio de e-mail
      toast.success("Ordem de Serviço enviada com sucesso!");
      setFormData({
        osNumber: "",
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startDateTime: "",
        interval: "",
        endDateTime: "",
        description: "",
      });
      setLocation("/partners/service-orders");
    } catch (error) {
      toast.error("Erro ao enviar a Ordem de Serviço");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = calculateTotalHours();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <CardTitle className="text-2xl">Nova Ordem de Serviço</CardTitle>
            <p className="text-red-100 mt-2">Preencha os dados da ordem de serviço abaixo</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Número da OS */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Número da OS *
              </label>
              <Input
                type="text"
                name="osNumber"
                value={formData.osNumber}
                onChange={handleInputChange}
                placeholder="Ex: OS-2024-001"
                required
              />
            </div>

            {/* Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome do Cliente *
                </label>
                <Input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Ex: Empresa XYZ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail do Cliente *
                </label>
                <Input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="cliente@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Tipo de Serviço */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Serviço *
              </label>
              <Input
                type="text"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                placeholder="Ex: Consultoria TOTVS"
                required
              />
            </div>

            {/* Data e Hora de Início */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data e Hora de Início *
                </label>
                <Input
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Intervalo (minutos)
                </label>
                <Input
                  type="number"
                  name="interval"
                  value={formData.interval}
                  onChange={handleInputChange}
                  placeholder="Ex: 60"
                />
              </div>
            </div>

            {/* Data e Hora de Término */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data e Hora de Término
              </label>
              <Input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleInputChange}
              />
            </div>

            {/* Total de Horas (Calculado) */}
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-foreground">
                Total de Horas (Calculado): <span className="text-lg font-bold text-red-600">{totalHours} horas</span>
              </p>
            </div>

            {/* Descrição do Serviço */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrição do Serviço
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva os detalhes do serviço prestado..."
                rows={5}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={loading || !formData.osNumber || !formData.clientName || !formData.clientEmail || !formData.serviceType || !formData.startDateTime}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading || !formData.osNumber || !formData.clientName || !formData.clientEmail || !formData.serviceType || !formData.startDateTime}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? "Enviando..." : "Enviar para Cliente"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
