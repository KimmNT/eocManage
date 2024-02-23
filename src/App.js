import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Test from "./pages/Testing";
import Admin from "./pages/Admin";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<Test />} />
        <Route path="/admin/NIC" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
