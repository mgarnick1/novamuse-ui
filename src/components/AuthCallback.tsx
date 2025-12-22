import { useAuth } from "react-oidc-context";

export function AuthCallback() {
    const auth = useAuth();

    if (auth.isLoading) return <div>Signing you in…</div>;
    if (auth.error) return <div>Error: {auth.error.message}</div>;

    // redirect to home after processing
    window.location.replace("/");
    return null;
}