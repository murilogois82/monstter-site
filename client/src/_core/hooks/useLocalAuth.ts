import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

// Autenticação local: redireciona para /simple-login
const DEFAULT_LOGIN_PATH = "/simple-login";

type UseLocalAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useLocalAuth(options?: UseLocalAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = DEFAULT_LOGIN_PATH } =
    options ?? {};
  const utils = trpc.useUtils();

  // Query para obter dados do usuário autenticado
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutation para logout
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      // Limpar dados de autenticação do localStorage
      localStorage.removeItem("manus-runtime-user-info");
      localStorage.removeItem("auth-token");
    },
  });

  // Função de logout
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      // Limpar localStorage
      localStorage.removeItem("manus-runtime-user-info");
      localStorage.removeItem("auth-token");
    }
  }, [logoutMutation, utils]);

  // Estado de autenticação
  const state = useMemo(() => {
    const userData = meQuery.data;
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(userData)
    );
    return {
      user: userData ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(userData),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  // Redirecionamento automático para login se não autenticado
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
