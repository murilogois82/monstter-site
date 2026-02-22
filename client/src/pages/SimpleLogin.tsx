import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const loginMutation = trpc.auth.loginLocal.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("[Login] Attempting login with username:", username);
      
      const result = await loginMutation.mutateAsync({
        username,
        password,
      });

      console.log("[Login] Login successful:", result);

      if (result.success) {
        // Redirect to admin dashboard
        console.log("[Login] Redirecting to admin dashboard");
        setLocation("/admin");
      } else {
        setError("Falha ao fazer login. Tente novamente.");
      }
    } catch (err: any) {
      console.error("[Login] Error:", err);
      const errorMessage = err?.message || "Falha ao fazer login. Verifique suas credenciais.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Acesso ao Sistema</CardTitle>
          <CardDescription className="text-slate-300">
            Digite suas credenciais para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Usuário
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">Credenciais de Teste:</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p>
                  Usuário: <code className="font-mono bg-blue-100 px-2 py-1 rounded">admin</code>
                </p>
                <p>
                  Senha: <code className="font-mono bg-blue-100 px-2 py-1 rounded">admin</code>
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-slate-600">
              <p>
                Problemas ao acessar?{" "}
                <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                  Recuperar senha
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
