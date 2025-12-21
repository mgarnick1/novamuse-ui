import type { User } from "../interfaces/User.ts";
import logo from "../assets/novamusequotes.png";

interface HeaderProps {
    user?: User;
    onSignIn?: () => void;
    onSignOut?: () => void;
}

export default function Header({
    user,
    onSignIn,
    onSignOut,
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
                <img
                    src={logo}
                    alt="NovaMuse"
                    className="h-8 w-8"
                />
                <span className="text-lg font-semibold tracking-tight">
                    NovaMuse
                </span>
            </div>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm text-gray-700">
                            {user.name}
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
