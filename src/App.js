import React, { useEffect, useState } from "react";
import mqtt from "mqtt";

const App = () => {
  const [messages, setMessages] = useState({});
  const topics = [];

  useEffect(() => {
    const brokerConfig = {
      host: "103.151.238.68",
      port: 8087,
      protocol: "mqtt",
      username: "guest",
      password: "123456a@",
    };

    const brokerUrl = `${brokerConfig.protocol}://${brokerConfig.host}:${brokerConfig.port}`;

    const client = mqtt.connect(brokerUrl, brokerConfig);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Subscribe to each topic in the state
      topics.forEach((topic) => {
        client.subscribe(topic);
        console.log(`Subscribed to topic: ${topic}`);
      });
    });

    client.on("message", (topic, payload) => {
      const receivedMessage = payload.toString();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [topic]: receivedMessage,
      }));
      console.log(`Received message on topic ${topic}: ${receivedMessage}`);
    });

    client.on("error", (error) => {
      console.error("MQTT Error:", error);
    });

    client.on("close", () => {
      console.log("Connection to MQTT broker closed");
    });

    client.on("offline", () => {
      console.log("MQTT client is offline");
    });

    // Clean up on component unmount
    return () => {
      client.end(); // Disconnect from the MQTT broker
    };
  }, [topics]); // Re-run effect when the topics array changes

  return (
    <div>
      <h1>MQTT Component</h1>
      {topics.map((topic) => (
        <p key={topic}>
          Received Message for {topic}: {messages[topic] || "No message"}
        </p>
      ))}
    </div>
  );
};

export default App;
