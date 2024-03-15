import React from "react";
import { Route, Routes } from "react-router-dom";
import Lobby from "./screens/Lobby";
import Room from "./screens/Room";

function App() {
  return (
    <React.Fragment>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </React.Fragment>
  );
}

export default App;
