import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ServiceOrderForm() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
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

  // Buscar lista de clientes
  const { data: clients } = trpc.clientManagement.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Buscar próximo número de OS
  const { data: nextOSNumber } = trpc.serviceOrder.getNextOSNumber.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOSMutation = trpc.serviceOrder.create.useMutation();

  // Preencher número de OS automaticamente quando carregar
  useEffect(() => {
    if (nextOSNumber) {
      console.log("Numero da OS gerado:", nextOSNumber);
      setFormData((prev) => ({
        ...prev,
        osNumber: nextOSNumber,
      }));
    }
  }, [nextOSNumber, isAuthenticated]);

  // Debug: log do formData quando osNumber muda
  useEffect(() => {
    if (formData.osNumber) {
      console.log("FormData atualizado com osNumber:", formData.osNumber);
    }
  }, [formData.osNumber]);

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

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients?.find((c) => c.id === parseInt(clientId));
    if (selectedClient) {
      console.log("Cliente selecionado:", selectedClient);
      setFormData((prev) => ({
        ...prev,
        clientName: selectedClient.name || "",
        clientEmail: selectedClient.email || "",
      }));
    } else {
      console.warn("Cliente não encontrado para ID:", clientId);
    }
  };

  const calculateTotalHours = () => {
    if (!formData.startDateTime || !formData.endDateTime) return 0;

    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    let diffHours = diffMs / (1000 * 60 * 60);

    // Descontar intervalo (em minutos) do total de horas
    if (formData.interval) {
      const intervalHours = parseInt(formData.interval) / 60;
      diffHours = diffHours - intervalHours;
    }

    return Math.max(0, Math.round(diffHours * 100) / 100);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validar campos obrigatórios
      if (!formData.osNumber.trim()) {
        toast.error("Número da OS não foi gerado. Recarregue a página.");
        setLoading(false);
        return;
      }
      if (!formData.clientName.trim()) {
        toast.error("Nome do cliente é obrigatório");
        setLoading(false);
        return;
      }
      if (!formData.clientEmail.trim()) {
        toast.error("E-mail do cliente é obrigatório");
        setLoading(false);
        return;
      }
      if (!formData.serviceType.trim()) {
        toast.error("Tipo de serviço é obrigatório");
        setLoading(false);
        return;
      }
      if (!formData.startDateTime) {
        toast.error("Data e hora de início é obrigatória");
        setLoading(false);
        return;
      }

      const totalHours = calculateTotalHours();

      await createOSMutation.mutateAsync({
        osNumber: formData.osNumber,
        clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
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
        osNumber: nextOSNumber || "",
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startDateTime: "",
        interval: "",
        endDateTime: "",
        description: "",
      });
      setSelectedClientId("");
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
      // Validar campos obrigatórios
      if (!formData.osNumber.trim()) {
        toast.error("Número da OS não foi gerado. Recarregue a página.");
        setLoading(false);
        return;
      }
      if (!formData.clientName.trim()) {
        toast.error("Nome do cliente é obrigatório");
        setLoading(false);
        return;
      }
      if (!formData.clientEmail.trim()) {
        toast.error("E-mail do cliente é obrigatório");
        setLoading(false);
        return;
      }
      if (!formData.serviceType.trim()) {
        toast.error("Tipo de serviço é obrigatório");
        setLoading(false);
        return;
      }
      if (!formData.startDateTime) {
        toast.error("Data e hora de início é obrigatória");
        setLoading(false);
        return;
      }

      const totalHours = calculateTotalHours();

      const result = await createOSMutation.mutateAsync({
        osNumber: formData.osNumber,
        clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
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
        osNumber: nextOSNumber || "",
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startDateTime: "",
        interval: "",
        endDateTime: "",
        description: "",
      });
      setSelectedClientId("");
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
            {/* Número da OS - Automático */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Número da OS (Automático)
              </Label>
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-foreground font-semibold">
                {formData.osNumber || "Carregando..."}
              </div>
            </div>

            {/* Seleção de Cliente */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Selecionar Cliente *
              </Label>
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um cliente cadastrado" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cliente - Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Nome do Cliente *
                </Label>
                <Input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Preenchido automaticamente"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  E-mail do Cliente *
                </Label>
                <Input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="Preenchido automaticamente"
                />
              </div>
            </div>

            {/* Tipo de Serviço */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Serviço *
              </Label>
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
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Data e Hora de Início *
                </Label>
                <Input
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Intervalo (minutos)
                </Label>
                <Input
                  type="number"
                  name="interval"
                  value={formData.interval}
                  onChange={handleInputChange}
                  placeholder="Ex: 60 (será descontado do total)"
                />
              </div>
            </div>

            {/* Data e Hora de Término */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Data e Hora de Término *
              </Label>
              <Input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Total de Horas (Calculado) */}
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-foreground">
                Total de Horas (Calculado com desconto de intervalo): <span className="text-lg font-bold text-red-600">{totalHours} horas</span>
              </p>
            </div>

            {/* Descrição do Serviço */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Descrição do Serviço
              </Label>
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
                disabled={loading || !formData.clientName || !formData.clientEmail || !formData.serviceType || !formData.startDateTime || !formData.endDateTime}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading || !formData.clientName || !formData.clientEmail || !formData.serviceType || !formData.startDateTime || !formData.endDateTime}
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
