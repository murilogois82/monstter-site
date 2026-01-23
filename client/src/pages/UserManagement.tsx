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

export default function UserManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
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

  return (
    <Layout>
      <AdminNav />
      <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Gerenciamento de Usuários</CardTitle>
                <p className="text-red-100 mt-2">Cadastre e gerencie usuários do sistema</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-red-600 hover:bg-red-50">
                    + Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo usuário abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Função</Label>
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
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">Carregando usuários...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Método de Login</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.id}</TableCell>
                        <TableCell>{u.name || "-"}</TableCell>
                        <TableCell>{u.email || "-"}</TableCell>
                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.loginMethod || "OAuth"}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {new Date(u.lastSignedIn).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(u)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-foreground/70 mb-4">Nenhum usuário encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Altere a função do usuário ou ative/inative o acesso.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={selectedUser.name || ""} disabled />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input value={selectedUser.email || ""} disabled />
                </div>
                <div>
                  <Label htmlFor="edit-role">Função</Label>
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
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateRole}
                className="bg-red-600 hover:bg-red-700"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </Layout>
  );
}
