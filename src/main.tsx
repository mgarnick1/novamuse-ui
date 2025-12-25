import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from 'oidc-client-ts';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthCallback } from './components/AuthCallback.tsx';


const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/${import.meta.env.VITE_COGNITO_USERPOOL_ID}`,
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: `${window.location.origin}/callback`,
  silent_redirect_uri: window.location.origin + "/silent-renew.html",
  response_type: "code",
  scope: "email openid profile",
  userStore: new WebStorageStateStore({
    store: window.localStorage,
  }),

  automaticSilentRenew: true,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/callback" element={<AuthCallback />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
