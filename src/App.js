import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import ConfigWifi from "./pages/ConfigWifi";
import ConfigPri from "./pages/ConfigPri";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/createPage" element={<CreatePage />} />
        <Route path="/configWifi" element={<ConfigWifi />} />
        <Route path="/configPri" element={<ConfigPri />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
