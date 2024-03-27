import React from "react";

function WifiInfo({ position }) {
  const { x, y } = position;
  return (
    <div
      style={{
        left: x,
        top: y,
        display: "block",
        position: "absolute",
        backgroundColor: " rgba(0, 0, 0, 0.5)",
        color: "white",
        padding: 10,
        borderRadius: 5,
      }}>
      Content inside hover box
    </div>
  );
}

export default WifiInfo;
