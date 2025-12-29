import { useAuth } from "react-oidc-context";
import logo from "../assets/novamusequotes.png";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
    onSignIn?: () => void;
    onSignOut?: () => void;
}

export default function Header({
    onSignIn,
    onSignOut,
}: HeaderProps) {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const user = auth.user;

    const navigateHome = () => {
        if (location.pathname === "/") {
            window.location.reload();
        } else {
            navigate("/");
        }
    };
    return (
        <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={navigateHome}>
                <img
                    src={logo}
                    alt="NovaMuse"
                    className="h-8 w-8 rounded-full"
                />
                <span className="text-lg font-semibold tracking-tight">
                    NovaMuse
                </span>
            </div>
            <nav className="flex items-center space-x-4">
                <a
                    href="/search"
                    className="px-3 py-1 rounded hover:bg-indigo-500 transition"
                >
                    Search
                </a>
            </nav>
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
