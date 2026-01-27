import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import AdminNav from "@/components/AdminNav";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PartnerUserAssociation() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: partners, isLoading: partnersLoading, refetch: refetchPartners } = trpc.partner.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const { data: users, isLoading: usersLoading } = trpc.userManagement.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const associateUserMutation = trpc.partner.associateUser.useMutation();

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "manager")) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Acesso negado</p>
        </div>
      </Layout>
    );
  }

  const handleAssociate = async () => {
    if (!selectedPartner || !selectedUserId) {
      toast.error("Selecione um parceiro e um usuário");
      return;
    }

    try {
      await associateUserMutation.mutateAsync({
        partnerId: selectedPartner.id,
        userId: parseInt(selectedUserId),
      });
      toast.success("Usuário associado ao parceiro com sucesso!");
      setIsAssociateDialogOpen(false);
      setSelectedPartner(null);
      setSelectedUserId("");
      refetchPartners();
    } catch (error) {
      toast.error("Erro ao associar usuário ao parceiro");
      console.error(error);
    }
  };

  const handleDisassociate = async (partnerId: number) => {
    try {
      await associateUserMutation.mutateAsync({
        partnerId,
        userId: null,
      });
      toast.success("Usuário desassociado do parceiro com sucesso!");
      refetchPartners();
    } catch (error) {
      toast.error("Erro ao desassociar usuário");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminNav />
        <div className="flex-1">
          <Card>
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
              <CardTitle className="text-2xl">Associação de Usuários a Parceiros</CardTitle>
              <p className="text-red-100 mt-2">Associe usuários do sistema aos registros de parceiros</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <Button
                  onClick={() => setIsAssociateDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Associar Usuário a Parceiro
                </Button>
              </div>

              {partnersLoading ? (
                <div className="text-center py-12">
                  <p className="text-foreground/60">Carregando parceiros...</p>
                </div>
              ) : partners && partners.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Usuário Associado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner: any) => {
                        const associatedUser = users?.find((u: any) => u.id === partner.userId);
                        return (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">{partner.companyName}</TableCell>
                            <TableCell>{partner.email}</TableCell>
                            <TableCell>
                              {associatedUser ? (
                                <Badge variant="default">
                                  {associatedUser.name} ({associatedUser.email})
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Não associado</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPartner(partner);
                                  setSelectedUserId(partner.userId?.toString() || "");
                                  setIsAssociateDialogOpen(true);
                                }}
                              >
                                Associar/Alterar
                              </Button>
                              {partner.userId && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDisassociate(partner.id)}
                                >
                                  Desassociar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

      {/* Dialog de Associação */}
      <Dialog open={isAssociateDialogOpen} onOpenChange={setIsAssociateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associar Usuário a Parceiro</DialogTitle>
            <DialogDescription>
              Selecione um parceiro e um usuário para associá-los
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partner-select">Parceiro</Label>
              <Select
                value={selectedPartner?.id?.toString() || ""}
                onValueChange={(value) => {
                  const partner = partners?.find((p: any) => p.id === parseInt(value));
                  setSelectedPartner(partner);
                }}
              >
                <SelectTrigger id="partner-select">
                  <SelectValue placeholder="Selecione um parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {partners?.map((partner: any) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-select">Usuário</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name} ({u.email}) - {u.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssociateDialogOpen(false);
                setSelectedPartner(null);
                setSelectedUserId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssociate}
              disabled={associateUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {associateUserMutation.isPending ? "Associando..." : "Associar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
