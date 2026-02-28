export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Autenticação simplificada: sempre redireciona para /simple-login.
// Se VITE_OAUTH_PORTAL_URL estiver configurado no .env, o OAuth pode ser
// reativado descomentando o bloco abaixo.
export const getLoginUrl = () => {
  return "/simple-login";

  // --- OAuth (desativado) ---
  // const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  // const appId = import.meta.env.VITE_APP_ID;
  // if (!oauthPortalUrl) return "/simple-login";
  // const redirectUri = `${window.location.origin}/api/oauth/callback`;
  // const state = btoa(redirectUri);
  // const url = new URL(`${oauthPortalUrl}/app-auth`);
  // url.searchParams.set("appId", appId ?? "");
  // url.searchParams.set("redirectUri", redirectUri);
  // url.searchParams.set("state", state);
  // url.searchParams.set("type", "signIn");
  // return url.toString();
};
