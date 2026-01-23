import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import AdminNav from "@/components/AdminNav";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClientManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const { data: clients, isLoading, refetch } = trpc.clientManagement.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const createClientMutation = trpc.clientManagement.create.useMutation();
  const updateClientMutation = trpc.clientManagement.update.useMutation();
  const deleteClientMutation = trpc.clientManagement.delete.useMutation();

  if (!isAuthenticated) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-4">
                Apenas administradores e gestores podem acessar esta página.
              </p>
              <Button onClick={() => setLocation("/")} className="w-full">
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    try {
      await createClientMutation.mutateAsync(newClient);
      toast.success("Cliente cadastrado com sucesso!");
      setNewClient({
        name: "",
        email: "",
        phone: "",
        company: "",
        cnpj: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao cadastrar cliente");
      console.error(error);
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      await updateClientMutation.mutateAsync({
        id: selectedClient.id,
        ...selectedClient,
      });
      toast.success("Cliente atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar cliente");
      console.error(error);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm("Tem certeza que deseja inativar este cliente?")) return;

    try {
      await deleteClientMutation.mutateAsync({ id });
      toast.success("Cliente inativado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao inativar cliente");
      console.error(error);
    }
  };

  const openEditDialog = (client: any) => {
    setSelectedClient({ ...client });
    setIsEditDialogOpen(true);
  };

  return (
    <Layout>
      <AdminNav />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Gerenciamento de Clientes</CardTitle>
                  <p className="text-red-100 mt-2">Cadastre e gerencie clientes do sistema</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-red-600 hover:bg-red-50">
                      + Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do cliente abaixo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          value={newClient.name}
                          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          value={newClient.company}
                          onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                          placeholder="Nome da empresa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={newClient.cnpj}
                          onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          value={newClient.zipCode}
                          onChange={(e) => setNewClient({ ...newClient, zipCode: e.target.value })}
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={newClient.city}
                          onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          maxLength={2}
                          value={newClient.state}
                          onChange={(e) => setNewClient({ ...newClient, state: e.target.value.toUpperCase() })}
                          placeholder="SP"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          value={newClient.address}
                          onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                          placeholder="Rua, número, complemento"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={newClient.notes}
                          onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                          placeholder="Informações adicionais sobre o cliente"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateClient}
                        disabled={createClientMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {createClientMutation.isPending ? "Cadastrando..." : "Cadastrar Cliente"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-foreground/60">Carregando clientes...</p>
                </div>
              ) : clients && clients.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client: any) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone || "-"}</TableCell>
                          <TableCell>{client.company || "-"}</TableCell>
                          <TableCell>
                            {client.city && client.state ? `${client.city}/${client.state}` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === "active" ? "default" : "secondary"}>
                              {client.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(client)}
                            >
                              Editar
                            </Button>
                            {user?.role === "admin" && client.status === "active" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClient(client.id)}
                              >
                                Inativar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground/60 mb-4">Nenhum cliente cadastrado</p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cadastrar Primeiro Cliente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Atualize os dados do cliente
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome *</Label>
                  <Input
                    id="edit-name"
                    value={selectedClient.name}
                    onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">E-mail *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedClient.email}
                    onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedClient.phone || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Input
                    id="edit-company"
                    value={selectedClient.company || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cnpj">CNPJ</Label>
                  <Input
                    id="edit-cnpj"
                    value={selectedClient.cnpj || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={selectedClient.status}
                    onValueChange={(value) => setSelectedClient({ ...selectedClient, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zipCode">CEP</Label>
                  <Input
                    id="edit-zipCode"
                    value={selectedClient.zipCode || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, zipCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={selectedClient.city || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input
                    id="edit-state"
                    maxLength={2}
                    value={selectedClient.state || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, state: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    value={selectedClient.address || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={selectedClient.notes || ""}
                    onChange={(e) => setSelectedClient({ ...selectedClient, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedClient(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateClient}
                disabled={updateClientMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {updateClientMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
