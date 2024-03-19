import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Test from "./pages/Testing";
import Admin from "./pages/Admin";
///
import WifiInfo from "./pages/WifiInfo";

const App = () => {
  const [showHoverBox, setShowHoverBox] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => {
    setShowHoverBox(true);
  };

  const handleMouseMove = (e) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setShowHoverBox(false);
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/testEnvi" element={<Test />} />
        <Route path="/admin/NIC" element={<Admin />} />
      </Routes>
    </BrowserRouter>

    // <div
    //   style={{
    //     width: 200,
    //     height: 100,
    //     backgroundColor: "lightblue",
    //     padding: 20,
    //     marginBottom: 20,
    //     position: "relative",
    //   }}
    //   onMouseEnter={handleMouseEnter}
    //   onMouseMove={handleMouseMove}
    //   onMouseLeave={handleMouseLeave}>
    //   Hover over me
    //   {showHoverBox && <WifiInfo position={hoverPosition} />}
    // </div>
  );
};

export default App;
