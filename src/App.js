import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ConfigWifi from "./pages/Testing";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/configWifi" element={<ConfigWifi />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
