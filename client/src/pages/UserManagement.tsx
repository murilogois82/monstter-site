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
import { Search, Plus, Edit2, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin" | "partner" | "manager",
  });

  const { data: users, isLoading, refetch } = trpc.userManagement.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createUserMutation = trpc.userManagement.create.useMutation();
  const updateRoleMutation = trpc.userManagement.updateRole.useMutation();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Acesso Restrito
              </CardTitle>
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

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-4">
                Apenas administradores podem acessar esta página.
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

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      admin: { label: "Administrador", variant: "destructive" },
      manager: { label: "Gestor", variant: "default" },
      partner: { label: "Parceiro", variant: "outline" },
      user: { label: "Usuário", variant: "secondary" },
    };

    const config = roleConfig[role] || { label: role, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      admin: "Acesso total ao sistema, gerenciamento de usuários e configurações",
      manager: "Acesso a relatórios, análises e gestão de parceiros",
      partner: "Acesso ao dashboard de parceiros e suas ordens de serviço",
      user: "Acesso básico ao sistema",
    };
    return descriptions[role] || "Sem descrição";
  };

  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync(newUser);
      toast.success("Usuário criado com sucesso!");
      setIsCreateDialogOpen(false);
      setNewUser({ name: "", email: "", role: "user" });
      refetch();
    } catch (error) {
      toast.error("Erro ao criar usuário");
      console.error(error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await updateRoleMutation.mutateAsync({
        id: selectedUser.id,
        role: selectedUser.role,
      });
      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
      console.error(error);
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleExportUsers = () => {
    if (!users) return;

    const csv = [
      ["ID", "Nome", "E-mail", "Função", "Método de Login", "Criado em", "Último Acesso"],
      ...users.map((u) => [
        u.id,
        u.name || "-",
        u.email || "-",
        u.role,
        u.loginMethod || "OAuth",
        new Date(u.createdAt || 0).toLocaleDateString("pt-BR"),
        new Date(u.lastSignedIn || 0).toLocaleDateString("pt-BR"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  // Filtrar usuários
  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      <AdminNav />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold">Gerenciamento de Usuários</CardTitle>
                  <p className="text-red-100 mt-2">
                    Cadastre, edite e gerencie permissões dos usuários do sistema
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportUsers}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-red-600 hover:bg-red-50">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Usuário</DialogTitle>
                        <DialogDescription>
                          Preencha os dados do novo usuário. Ele receberá um e-mail de boas-vindas.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="João Silva"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="joao@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Função *</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuário</SelectItem>
                              <SelectItem value="partner">Parceiro</SelectItem>
                              <SelectItem value="manager">Gestor</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-2">
                            {getRoleDescription(newUser.role)}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateUser}
                          disabled={!newUser.name || !newUser.email}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Criar Usuário
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="partner">Parceiro</SelectItem>
                    <SelectItem value="manager">Gestor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Usuários */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="text-foreground/70 mt-4">Carregando usuários...</p>
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-gray-200">
                        <TableHead className="font-bold">ID</TableHead>
                        <TableHead className="font-bold">Nome</TableHead>
                        <TableHead className="font-bold">E-mail</TableHead>
                        <TableHead className="font-bold">Função</TableHead>
                        <TableHead className="font-bold">Método de Login</TableHead>
                        <TableHead className="font-bold">Criado em</TableHead>
                        <TableHead className="font-bold">Último Acesso</TableHead>
                        <TableHead className="font-bold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-600">{u.id}</TableCell>
                          <TableCell className="font-medium">{u.name || "-"}</TableCell>
                          <TableCell className="text-gray-600">{u.email || "-"}</TableCell>
                          <TableCell>{getRoleBadge(u.role || "user")}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {u.loginMethod || "OAuth"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(u.createdAt || 0).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(u.lastSignedIn || 0).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(u)}
                              className="hover:bg-red-50 hover:border-red-300"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Mostrando {filteredUsers.length} de {users?.length} usuários
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-foreground/70 mb-4">
                    {searchTerm || filterRole !== "all"
                      ? "Nenhum usuário encontrado com os filtros aplicados."
                      : "Nenhum usuário cadastrado ainda."}
                  </p>
                  {(searchTerm || filterRole !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterRole("all");
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog de Edição */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Altere a função do usuário para gerenciar suas permissões no sistema.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4 py-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Alterando a função de: <strong>{selectedUser.name}</strong>
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label className="text-gray-600">Nome</Label>
                    <Input value={selectedUser.name || ""} disabled className="bg-gray-100" />
                  </div>
                  <div>
                    <Label className="text-gray-600">E-mail</Label>
                    <Input value={selectedUser.email || ""} disabled className="bg-gray-100" />
                  </div>
                  <div>
                    <Label htmlFor="edit-role" className="font-semibold">
                      Nova Função *
                    </Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value: any) =>
                        setSelectedUser({ ...selectedUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="partner">Parceiro</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      {getRoleDescription(selectedUser.role)}
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {updateRoleMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
