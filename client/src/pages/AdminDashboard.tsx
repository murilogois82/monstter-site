import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

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
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

    const menuItems = [
    {
      title: "Calendário",
      description: "Visualizar OS agendadas e disponibilidade",
      icon: BarChart3,
      href: "/calendar",
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    },
    {
      title: "Ordens de Serviço",
      description: "Gerenciar todas as ordens de serviço",
      icon: FileText,
      href: "/admin/service-orders",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    },
    {
      title: "Parceiros",
      description: "Gerenciar parceiros e suas informações",
      icon: Users,
      href: "/admin/partners",
      color: "bg-green-500/10 text-green-500 border-green-500/30",
    },
    {
      title: "Pagamentos",
      description: "Gerenciar pagamentos e financeiro",
      icon: DollarSign,
      href: "/admin/payments-dashboard",
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    },
    {
      title: "Dashboard Financeiro",
      description: "Visualizar análises financeiras",
      icon: BarChart3,
      href: "/admin/financial",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    },
    {
      title: "Usuários",
      description: "Gerenciar usuários do sistema",
      icon: Users,
      href: "/admin/users",
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    },
    {
      title: "Clientes",
      description: "Gerenciar clientes",
      icon: Users,
      href: "/admin/clients",
      color: "bg-pink-500/10 text-pink-500 border-pink-500/30",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Dashboard de Administração
              </h1>
              <p className="text-gray-400">
                Bem-vindo, {user.name || user.email}
              </p>
            </div>
            <Button
              onClick={() => {
                logout();
                setLocation("/");
              }}
              variant="outline"
              className="flex items-center gap-2 border-red-500/30 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">
                    {user.role === "admin" ? "Admin" : "Manager"}
                  </div>
                  <p className="text-gray-400 text-sm">Seu Papel</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    Ativo
                  </div>
                  <p className="text-gray-400 text-sm">Status</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    Acesso Total
                  </div>
                  <p className="text-gray-400 text-sm">Permissões</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    Online
                  </div>
                  <p className="text-gray-400 text-sm">Conectado</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => setLocation(item.href)}
                  className="group"
                >
                  <Card className={`h-full bg-gray-900/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(255,0,0,0.1)]`}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${item.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-white text-lg">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-6 bg-gray-900/50 border border-gray-700 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Dicas de Navegação</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Use o menu acima para acessar diferentes áreas do sistema</li>
              <li>• Clique em qualquer card para ir para a seção correspondente</li>
              <li>• Você pode fazer logout a qualquer momento usando o botão no canto superior direito</li>
              <li>• Todas as ações são registradas para auditoria</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
