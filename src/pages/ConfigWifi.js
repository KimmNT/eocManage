import React from "react";
import mqtt from "mqtt";

const ConfigWifi = () => {
  const handlePublish = () => {
    const brokerConfig = {
      host: "103.151.238.68",
      port: 8087,
      protocol: "websockets",
      username: "guest",
      password: "123456a@",
    };

    const brokerUrl = `${brokerConfig.protocol}://${brokerConfig.host}:${brokerConfig.port}`;

    const client = mqtt.connect(brokerUrl, brokerConfig);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      const topic = "device/00097/cmd";
      const payload = {
        type: "wifi",
        deviceId: "n_123456",
        data: { ssidName: "DOREMON", password: "kimtrang1357" },
      };

      // Publish the message
      client.publish(topic, JSON.stringify(payload), (err) => {
        // Handling the result of the publish
        if (err) {
          console.error(`Error publishing message to topic ${topic}:`, err);
        } else {
          console.log(
            `Published message to topic: ${topic} ${JSON.stringify(payload)}`
          );
        }

        // Disconnect from the MQTT broker
        client.end();
      });
    });
  };

  return (
    <div>
      <h2>Config wifi</h2>
      <button onClick={handlePublish}>CONFIG WIFI</button>
    </div>
  );
};

export default ConfigWifi;
