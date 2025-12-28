import type { AuthContextProps } from "react-oidc-context";

export const signOutRedirect = (auth: AuthContextProps) => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const logoutUri = window.location.origin;
    const cognitoDomain = "https://novamuse.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    auth.removeUser();
  };