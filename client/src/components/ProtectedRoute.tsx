import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Array<"user" | "admin" | "partner" | "manager">;
  fallback?: ReactNode;
}

/**
 * Componente que protege rotas verificando autenticação e permissões
 * @param children - Conteúdo a ser renderizado se autorizado
 * @param requiredRoles - Array de roles permitidas (se vazio, apenas verifica autenticação)
 * @param fallback - Conteúdo alternativo se não autorizado
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Ainda carregando
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Não autenticado
  if (!isAuthenticated || !user) {
    return (
      fallback || (
        <Layout>
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Acesso Restrito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-6">
                  Você precisa estar autenticado para acessar esta página.
                </p>
                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Ir para Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      )
    );
  }

  // Verificar permissões
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      fallback || (
        <Layout>
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Lock className="h-5 w-5" />
                  Acesso Negado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-2">
                  Você não tem permissão para acessar esta página.
                </p>
                <p className="text-sm text-foreground/50 mb-6">
                  Sua função: <strong>{user.role}</strong>
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="w-full"
                  variant="outline"
                >
                  Voltar ao Início
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      )
    );
  }

  // Autorizado
  return <>{children}</>;
}
