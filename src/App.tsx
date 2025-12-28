
import './App.css'
import Header from './components/Header.tsx';
import RandomQuote from './components/RandomQuote.tsx';

import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();
  
  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const logoutUri = window.location.origin;
    const cognitoDomain = "https://novamuse.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    auth.removeUser();
  };

  const signIn = () => {
    auth.signinRedirect();
  };

  return (
    <>
      <Header
        onSignIn={() =>
          signIn()
        }
        onSignOut={() => signOutRedirect()}
      />
      <RandomQuote />
    </>
  )
}

export default App
