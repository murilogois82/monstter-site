import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Users, DollarSign, UserCheck, Briefcase, Link as LinkIcon } from "lucide-react";

export default function AdminNav() {
  const [location] = useLocation();

  const adminNavItems = [
    { 
      label: "Ordens de Serviço", 
      path: "/admin/service-orders",
      icon: FileText,
      description: "Gerenciar todas as OS"
    },
    { 
      label: "Dashboard Financeiro", 
      path: "/admin/payments-dashboard",
      icon: DollarSign,
      description: "Métricas e pagamentos"
    },
    { 
      label: "Gerenciar Usuários", 
      path: "/admin/users",
      icon: Users,
      description: "Controle de acesso"
    },
    { 
      label: "Clientes", 
      path: "/admin/clients",
      icon: UserCheck,
      description: "Cadastro de clientes"
    },
    { 
      label: "Parceiros", 
      path: "/admin/partners",
      icon: Briefcase,
      description: "Cadastro de parceiros"
    },
    { 
      label: "Associar Usuários", 
      path: "/admin/partner-users",
      icon: LinkIcon,
      description: "Associar usuários a parceiros"
    },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto">
        <div className="flex items-center gap-1 overflow-x-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer border-b-2 whitespace-nowrap",
                    isActive 
                      ? "text-red-500 border-red-500 bg-gray-800/50" 
                      : "text-gray-400 border-transparent hover:text-white hover:bg-gray-800/30"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
