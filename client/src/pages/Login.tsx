import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";

export default function Login() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect based on role if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const timer = setTimeout(() => {
        if (user.role === "admin" || user.role === "manager") {
          setLocation("/admin");
        } else if (user.role === "partner") {
          setLocation("/partners/dashboard");
        } else {
          setLocation("/");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, loading, setLocation]);

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

  if (isAuthenticated && user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Redirecionando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 px-4">
        <Card className="w-full max-w-md bg-gray-900 border-red-500/30">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Monstter
            </CardTitle>
            <p className="text-sm text-gray-400">
              Acesso à Área de Parceiros e Administração
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Áreas Disponíveis
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Administração e Gestão
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Dashboard de Parceiros
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Relatórios e Análises
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]"
              >
                Fazer Login com Manus
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Você será redirecionado para o dashboard apropriado após o login
              </p>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs text-gray-400 text-center">
                Não tem uma conta?{" "}
                <a href="/" className="text-red-500 hover:text-red-400">
                  Voltar ao início
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
