import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Layout from "@/components/Layout";

export default function Login() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    // Se ja autenticado, redirecionar para a area correta
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.role === "manager") {
        setLocation("/admin");
      } else if (user.role === "partner") {
        setLocation("/partners/dashboard");
      } else {
        setLocation("/");
      }
      return;
    }
    // Nao autenticado: redirecionar para login simples
    setLocation("/simple-login");
  }, [isAuthenticated, user, loading, setLocation]);

  // Exibir spinner enquanto verifica autenticacao
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    </Layout>
  );
}
