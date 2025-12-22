import { useAuth } from "react-oidc-context";
import logo from "../assets/novamusequotes.png";

interface HeaderProps {
    onSignIn?: () => void;
    onSignOut?: () => void;
}

export default function Header({
    onSignIn,
    onSignOut,
}: HeaderProps) {
    const auth = useAuth();
    const user = auth.user;
    return (
        <header className="sticky top-0 z-50 border-b flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
                <img
                    src={logo}
                    alt="NovaMuse"
                    className="h-8 w-8 rounded-full"
                />
                <span className="text-lg font-semibold tracking-tight">
                    NovaMuse
                </span>
            </div>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm font-medium">
                            {user.profile.email}
                        </span>

                        <button
                            onClick={onSignOut}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onSignIn}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        Sign in
                    </button>
                )}
            </div>
        </header>
    );
}
