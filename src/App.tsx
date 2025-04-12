import React, { useEffect, useState } from "react";
import { auth, subscribeAuth } from "./lib/firebase";
import { HabitList } from "./components/HabitList";
import Header from "./components/Header"; // ← 追加

function App() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = subscribeAuth(setUser);
    return () => unsub();
  }, []);

  return (
    <div>
      <Header />
      {user && <HabitList />}
    </div>
  );
}

export default App;
