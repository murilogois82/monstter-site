import { useState, useEffect } from "react";
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

export default function PartnerManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    bankName: "",
    bankAccount: "",
    bankRoutingNumber: "",
    paymentType: "hourly" as "fixed" | "hourly",
    paymentValue: "",
    notes: "",
  });

  const { data: partners, isLoading, refetch } = trpc.partner.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const createPartnerMutation = trpc.partner.create.useMutation();
  const updatePartnerMutation = trpc.partner.update.useMutation();
  const deletePartnerMutation = trpc.partner.delete.useMutation();

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

  const handleCreatePartner = async () => {
    if (!newPartner.name || !newPartner.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    try {
      await createPartnerMutation.mutateAsync({
        ...newPartner,
        paymentValue: newPartner.paymentValue ? parseFloat(newPartner.paymentValue) : 0,
      });
      toast.success("Parceiro cadastrado com sucesso!");
      setNewPartner({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        bankName: "",
        bankAccount: "",
        bankRoutingNumber: "",
        paymentType: "hourly",
        paymentValue: "",
        notes: "",
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao cadastrar parceiro");
      console.error(error);
    }
  };

  const handleUpdatePartner = async () => {
    if (!selectedPartner) return;

    // Validar campos obrigatórios
    if (!selectedPartner.name || !selectedPartner.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    try {
      await updatePartnerMutation.mutateAsync({
        id: selectedPartner.id,
        name: selectedPartner.name,
        email: selectedPartner.email,
        phone: selectedPartner.phone || undefined,
        cpf: selectedPartner.cpf || undefined,
        bankName: selectedPartner.bankName || undefined,
        bankAccount: selectedPartner.bankAccount || undefined,
        bankRoutingNumber: selectedPartner.bankRoutingNumber || undefined,
        paymentType: selectedPartner.paymentType,
        paymentValue: selectedPartner.paymentValue ? parseFloat(selectedPartner.paymentValue) : 0,
        notes: selectedPartner.notes || undefined,
      });
      toast.success("Parceiro atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedPartner(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar parceiro");
      console.error(error);
    }
  };

  const handleDeletePartner = async (id: number) => {
    if (!confirm("Tem certeza que deseja inativar este parceiro?")) return;

    try {
      await deletePartnerMutation.mutateAsync({ id });
      toast.success("Parceiro inativado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao inativar parceiro");
      console.error(error);
    }
  };

  const openEditDialog = (partner: any) => {
    // Mapear companyName para name para compatibilidade com o formulário
    setSelectedPartner({
      ...partner,
      name: partner.companyName || partner.name || "",
      paymentValue: partner.paidValue || partner.paymentValue || "",
    });
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
                  <CardTitle className="text-2xl">Gerenciamento de Parceiros</CardTitle>
                  <p className="text-red-100 mt-2">Cadastre e gerencie parceiros (consultores)</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-red-600 hover:bg-red-50">
                      + Novo Parceiro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Parceiro</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do parceiro abaixo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          value={newPartner.name}
                          onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newPartner.email}
                          onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={newPartner.phone}
                          onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={newPartner.cpf}
                          onChange={(e) => setNewPartner({ ...newPartner, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Banco</Label>
                        <Input
                          id="bankName"
                          value={newPartner.bankName}
                          onChange={(e) => setNewPartner({ ...newPartner, bankName: e.target.value })}
                          placeholder="Nome do banco"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Conta Bancária</Label>
                        <Input
                          id="bankAccount"
                          value={newPartner.bankAccount}
                          onChange={(e) => setNewPartner({ ...newPartner, bankAccount: e.target.value })}
                          placeholder="0000000-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankRoutingNumber">Agência</Label>
                        <Input
                          id="bankRoutingNumber"
                          value={newPartner.bankRoutingNumber}
                          onChange={(e) => setNewPartner({ ...newPartner, bankRoutingNumber: e.target.value })}
                          placeholder="0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentType">Tipo de Pagamento *</Label>
                        <Select 
                          value={newPartner.paymentType}
                          onValueChange={(value) => setNewPartner({ ...newPartner, paymentType: value as "fixed" | "hourly" })}
                        >
                          <SelectTrigger id="paymentType">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Por Hora</SelectItem>
                            <SelectItem value="fixed">Valor Fixo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentValue">Valor de Pagamento *</Label>
                        <Input
                          id="paymentValue"
                          type="number"
                          step="0.01"
                          value={newPartner.paymentValue}
                          onChange={(e) => setNewPartner({ ...newPartner, paymentValue: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={newPartner.notes}
                          onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                          placeholder="Informações adicionais sobre o parceiro"
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
                        onClick={handleCreatePartner}
                        disabled={createPartnerMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {createPartnerMutation.isPending ? "Cadastrando..." : "Cadastrar Parceiro"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-foreground/60">Carregando parceiros...</p>
                </div>
              ) : partners && partners.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Tipo Pagamento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner: any) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell>{partner.email}</TableCell>
                          <TableCell>{partner.phone || "-"}</TableCell>
                          <TableCell>{partner.cpf || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={partner.paymentType === "hourly" ? "default" : "secondary"}>
                              {partner.paymentType === "hourly" ? "Por Hora" : "Fixo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {partner.paidValue ? `R$ ${parseFloat(partner.paidValue).toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                              {partner.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(partner)}
                              className="mr-2"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePartner(partner.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Inativar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground/60">Nenhum parceiro cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
            <DialogDescription>
              Atualize os dados do parceiro abaixo
            </DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={selectedPartner.name || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedPartner.email || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={selectedPartner.phone || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cpf">CPF</Label>
                <Input
                  id="edit-cpf"
                  value={selectedPartner.cpf || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bankName">Banco</Label>
                <Input
                  id="edit-bankName"
                  value={selectedPartner.bankName || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, bankName: e.target.value })}
                  placeholder="Nome do banco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bankAccount">Conta Bancária</Label>
                <Input
                  id="edit-bankAccount"
                  value={selectedPartner.bankAccount || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, bankAccount: e.target.value })}
                  placeholder="0000000-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bankRoutingNumber">Agência</Label>
                <Input
                  id="edit-bankRoutingNumber"
                  value={selectedPartner.bankRoutingNumber || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, bankRoutingNumber: e.target.value })}
                  placeholder="0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentType">Tipo de Pagamento *</Label>
                <Select 
                  value={selectedPartner.paymentType}
                  onValueChange={(value) => setSelectedPartner({ ...selectedPartner, paymentType: value })}
                >
                  <SelectTrigger id="edit-paymentType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Por Hora</SelectItem>
                    <SelectItem value="fixed">Valor Fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentValue">Valor de Pagamento *</Label>
                <Input
                  id="edit-paymentValue"
                  type="number"
                  step="0.01"
                  value={selectedPartner.paymentValue || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, paymentValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-notes">Observações</Label>
                <Textarea
                  id="edit-notes"
                  value={selectedPartner.notes || ""}
                  onChange={(e) => setSelectedPartner({ ...selectedPartner, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o parceiro"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePartner}
              disabled={updatePartnerMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {updatePartnerMutation.isPending ? "Atualizando..." : "Atualizar Parceiro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
