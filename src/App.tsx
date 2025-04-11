import React from "react";
import { HabitList } from "./component/HabitList";

function App(){
  return(
    <div style={{ padding: "20px" }}>
    <h1>習慣トラッカー</h1>
    <HabitList />
  </div>
  );
}

export default App;