import React, { useEffect, useState } from "react";
import { auth, subscribeAuth } from "./lib/firebase";
import { HabitList } from "./components/HabitList";
import LoginButtons from "./components/LoginButtons";

function App() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = subscribeAuth(setUser);
    return () => unsub();
  }, []);

  return (
    <div>
      <h1>習慣トラッカー</h1>
      <LoginButtons />
      {user && <HabitList />}
    </div>
  );
}

export default App;
