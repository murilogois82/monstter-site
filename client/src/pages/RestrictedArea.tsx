import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Settings,
  Building2,
  UserCheck,
  TrendingUp,
  Lock,
  LogOut,
} from "lucide-react";

interface MenuSection {
  title: string;
  description: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  description: string;
}

export default function RestrictedArea() {
  const { user, isAuthenticated, loading, logout } = useLocalAuth();
  const [, setLocation] = useLocation();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/simple-login");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Carregando área restrita...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Definir itens do menu baseado no papel do usuário
  const adminMenuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/admin",
      roles: ["admin", "manager"],
      description: "Visão geral do sistema",
    },
    {
      label: "Ordens de Serviço",
      icon: <FileText className="w-6 h-6" />,
      path: "/admin/service-orders",
      roles: ["admin", "manager"],
      description: "Gerenciar ordens de serviço",
    },
    {
      label: "Calendário",
      icon: <Calendar className="w-6 h-6" />,
      path: "/calendar",
      roles: ["admin", "manager"],
      description: "Visualizar agenda de OS",
    },
    {
      label: "Pagamentos",
      icon: <DollarSign className="w-6 h-6" />,
      path: "/admin/payments-dashboard",
      roles: ["admin", "manager"],
      description: "Dashboard de pagamentos",
    },
    {
      label: "Usuários",
      icon: <Users className="w-6 h-6" />,
      path: "/admin/users",
      roles: ["admin"],
      description: "Gerenciar usuários",
    },
    {
      label: "Clientes",
      icon: <Building2 className="w-6 h-6" />,
      path: "/admin/clients",
      roles: ["admin"],
      description: "Gerenciar clientes",
    },
    {
      label: "Parceiros",
      icon: <UserCheck className="w-6 h-6" />,
      path: "/admin/partners",
      roles: ["admin"],
      description: "Gerenciar parceiros",
    },
    {
      label: "Usuários de Parceiros",
      icon: <Users className="w-6 h-6" />,
      path: "/admin/partner-users",
      roles: ["admin"],
      description: "Associar usuários a parceiros",
    },
    {
      label: "Financeiro",
      icon: <TrendingUp className="w-6 h-6" />,
      path: "/admin/financial",
      roles: ["admin"],
      description: "Dashboard financeiro",
    },
  ];

  const partnerMenuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <BarChart3 className="w-6 h-6" />,
      path: "/partners/dashboard",
      roles: ["partner"],
      description: "Visão geral do parceiro",
    },
    {
      label: "Ordens de Serviço",
      icon: <FileText className="w-6 h-6" />,
      path: "/partners/service-orders",
      roles: ["partner"],
      description: "Minhas ordens de serviço",
    },
  ];

  // Filtrar itens baseado no papel do usuário
  const filteredAdminItems = adminMenuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const filteredPartnerItems = partnerMenuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  // Renderizar seções de menu
  const menuSections: MenuSection[] = [];

  if (filteredAdminItems.length > 0) {
    menuSections.push({
      title: "Administração",
      description: "Ferramentas administrativas do sistema",
      items: filteredAdminItems,
    });
  }

  if (filteredPartnerItems.length > 0) {
    menuSections.push({
      title: "Parceiro",
      description: "Área do parceiro",
      items: filteredPartnerItems,
    });
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/simple-login");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  <Lock className="w-8 h-8 inline-block mr-3 text-blue-600" />
                  Área Restrita
                </h1>
                <p className="text-slate-600">
                  Bem-vindo, <span className="font-semibold text-slate-900">{user?.name || user?.email || "Usuário"}</span>
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
          </div>

          {/* Menu Sections */}
          {menuSections.length > 0 ? (
            <div className="space-y-8">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {section.title}
                    </h2>
                    <p className="text-slate-600">{section.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item, itemIndex) => (
                      <Card
                        key={itemIndex}
                        className="hover:shadow-lg transition-shadow cursor-pointer group border-slate-200 hover:border-blue-300"
                        onClick={() => setLocation(item.path)}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                              {item.icon}
                            </div>
                          </div>
                          <CardTitle className="text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.label}
                          </CardTitle>
                          <CardDescription className="text-slate-600">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(item.path);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Acessar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Acesso Limitado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Sua conta não tem permissão para acessar nenhuma área restrita. Entre em contato com o administrador.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer Info */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Papel:</span> {user?.role === "admin" ? "Administrador" : user?.role === "manager" ? "Gerenciador" : user?.role === "partner" ? "Parceiro" : "Usuário"}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              <span className="font-semibold text-slate-900">Email:</span> {user?.email || "Não informado"}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
