import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import CalendarComponent from "@/components/CalendarComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, User, CheckCircle2 } from "lucide-react";

export default function CalendarPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Redirect if not authenticated or not admin/manager
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "manager"))) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Fetch service orders
  const { data: serviceOrders = [], isLoading: ordersLoading } =
    trpc.serviceOrder.list.useQuery();

  // Fetch partners
  const { data: partners = [], isLoading: partnersLoading } =
    trpc.partner.list.useQuery();

  // Transform service orders to calendar events
  const calendarEvents = useMemo(() => {
    return serviceOrders
      .filter((order) => {
        if (selectedPartner && order.partnerId !== parseInt(selectedPartner)) {
          return false;
        }
        if (selectedStatus && order.status !== selectedStatus) {
          return false;
        }
        return true;
      })
      .map((order) => ({
        id: order.id,
        osNumber: `OS-${order.id}`,
        partnerName:
          partners.find((p) => p.id === order.partnerId)?.companyName ||
          "Desconhecido",
        startDateTime: new Date(order.startDateTime),
        endDateTime: new Date(order.endDateTime),
        status: order.status,
        totalHours: order.totalHours || 0,
      }));
  }, [serviceOrders, selectedPartner, selectedStatus, partners]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = calendarEvents.length;
    const inProgress = calendarEvents.filter(
      (e) => e.status === "in_progress"
    ).length;
    const completed = calendarEvents.filter(
      (e) => e.status === "completed"
    ).length;
    const totalHours = calendarEvents.reduce((sum, e) => sum + e.totalHours, 0);

    return { total, inProgress, completed, totalHours };
  }, [calendarEvents]);

  // Get partner availability
  const partnerAvailability = useMemo(() => {
    const availability: Record<
      number,
      { name: string; totalHours: number; committed: number }
    > = {};

    partners.forEach((partner) => {
      const partnerOrders = calendarEvents.filter(
        (e) => e.partnerName === partner.companyName
      );
      const committed = partnerOrders.reduce((sum, e) => sum + e.totalHours, 0);

      availability[partner.id] = {
        name: partner.companyName,
        totalHours: partner.paidValue || 0,
        committed,
      };
    });

    return availability;
  }, [partners, calendarEvents]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Por favor, faça login para acessar.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Calendário de Ordens de Serviço
            </h1>
            <p className="text-gray-400">
              Visualize todas as OS agendadas, prazos e disponibilidade de
              parceiros
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">
                    {stats.total}
                  </div>
                  <p className="text-gray-400 text-sm">Total de OS</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {stats.inProgress}
                  </div>
                  <p className="text-gray-400 text-sm">Em Progresso</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {stats.completed}
                  </div>
                  <p className="text-gray-400 text-sm">Concluídas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    {stats.totalHours}h
                  </div>
                  <p className="text-gray-400 text-sm">Total de Horas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-gray-900/50 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-400 mb-2 block">
                  Parceiro
                </label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Todos os parceiros" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="">Todos os parceiros</SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id.toString()}>
                        {partner.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-gray-400 mb-2 block">
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="closed">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedPartner("");
                    setSelectedStatus("");
                  }}
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <div className="mb-8">
            {ordersLoading ? (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Carregando calendário...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CalendarComponent
                events={calendarEvents}
                selectedPartner={
                  selectedPartner ? parseInt(selectedPartner) : undefined
                }
              />
            )}
          </div>

          {/* Partner Availability */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Disponibilidade de Parceiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(partnerAvailability).map(([id, data]) => {
                  const utilizacao =
                    data.totalHours > 0
                      ? Math.round((data.committed / data.totalHours) * 100)
                      : 0;
                  const isOverloaded = utilizacao > 100;
                  const isHighUtilization = utilizacao > 80;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{data.name}</p>
                          <p className="text-sm text-gray-400">
                            {data.committed}h / {data.totalHours}h comprometidas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverloaded
                                ? "bg-red-500"
                                : isHighUtilization
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(utilizacao, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <Badge
                          className={`${
                            isOverloaded
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : isHighUtilization
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}
                        >
                          {utilizacao}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {Object.keys(partnerAvailability).length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    Nenhum parceiro disponível para exibir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
