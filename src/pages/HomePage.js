import React, { useEffect } from "react";
// import { Link } from "react-router-dom";
// import mqtt from "mqtt";

const HomePage = () => {
  //   const [mqttClient, setMqttClient] = useState(null);
  useEffect(() => {
    console.log("LOADED");
  });

  const handleClick = () => {
    console.log("BUTTON CLICKED!");
  };

  return (
    <div>
      <button onClick={handleClick}>CLICK ME!</button>
    </div>
  );
};

export default HomePage;
