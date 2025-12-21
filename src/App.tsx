import { useState } from 'react'
import './App.css'
import Header from './components/Header.tsx';
import RandomQuote from './components/RandomQuote.tsx';
import type { User } from './interfaces/User.ts';

function App() {
  const [user, setUser] = useState<User | undefined>();

  return (
    <>
      <Header
        user={user}
        onSignIn={() =>
          setUser({
            id: "1",
            name: "Mark",
            email: "mark@example.com",
          })
        }
        onSignOut={() => setUser(undefined)}
      />
      <RandomQuote />
    </>
  )
}

export default App
