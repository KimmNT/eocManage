import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import "../scss/HomeStyle.scss";
import { Link } from "react-router-dom";

const HomePage = () => {
  // const [message, setMessages] = useState({});
  const [informationMessages, setInformationMessages] = useState({});
  const [topics, setTopics] = useState([]);
  const [deviceId, setDeviceId] = useState("");

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
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`Error subscribing to topic ${topic}:`, err);
          } else {
            console.log(`Subscribed to topic: ${topic}`);
          }
        });
      });
    });

    client.on("message", (topic, payload) => {
      try {
        const receivedMessage = JSON.parse(payload.toString());

        console.log(`Received message on topic ${topic}:`, receivedMessage);

        // Check the type and update the state accordingly
        if (receivedMessage.type === "information") {
          setInformationMessages((prevMessages) => ({
            ...prevMessages,
            [topic]: receivedMessage,
          }));
        }

        // Add similar conditions for other message types if needed
      } catch (error) {
        console.error(`Error parsing JSON message on topic ${topic}:`, error);
      }
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
      topics.forEach((topic) => {
        client.unsubscribe(topic);
        console.log(`Unsubscribed from topic: ${topic}`);
      });
      client.end(); // Disconnect from the MQTT broker
    };
  }, [topics]); // Re-run effect when the topics array changes

  const handleDeviceInput = (event) => {
    setDeviceId(event.target.value);
  };

  const handleAddDevice = () => {
    setTopics((preDevice) => [...preDevice, deviceId]);
    setDeviceId("");
  };

  const handleDeleteDevice = (index) => {
    setTopics((prevTopics) => {
      const newTopics = [...prevTopics];
      newTopics.splice(index, 1);
      return newTopics;
    });
  };
  return (
    <div className="container">
      <div className="header">
        <div className="header__content">
          <div className="header__headline">
            <p className="headline__title">eoc</p>
            <div className="headline__create">
              <input
                placeholder="enter device's id"
                value={deviceId}
                onChange={handleDeviceInput}
                className="create__input"
              />
              <button className="create__btn" onClick={handleAddDevice}>
                +
              </button>
            </div>
          </div>
          <div className="header__menu">
            <Link className="menu__item" to={"/wifiCongif"} target="_blank">
              Config WiFi
            </Link>
            <Link className="menu__item" to={"/priorityConfig"} target="_blank">
              Config Priority
            </Link>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="device__list">
          {topics.map((item, index) => (
            <div className="device" key={index}>
              <p className="device__name">{item}</p>
              {informationMessages[item] ? (
                <div className="device__info">
                  {/* VERSION */}
                  <div className="info__version">
                    <p className="info__name">Version: </p>
                    <p className="info__value">
                      {informationMessages[item].data.FWver}
                    </p>
                  </div>
                  {/* CONNECTION TYPE - PRIORITY */}
                  <div className="info__group">
                    {/* WHEN CONNECTION TYPE IS SIM */}
                    {informationMessages[item].data.CONtyp === 1 ? (
                      <div className="info__version sim connect">
                        <p className="info__name">CON Priority: </p>
                        <p className="info__value">
                          {informationMessages[item].data.CONtyp}
                        </p>
                      </div>
                    ) : (
                      <div className="info__version sim not__connect">
                        <p className="info__name">CON Priority: </p>
                        <p className="info__value">
                          {informationMessages[item].data.CONtyp}
                        </p>
                      </div>
                    )}
                    {/* WHEN CONNECTION TYPE IS LAN */}
                    {informationMessages[item].data.CONtyp === 2 ? (
                      <div className="info__version lan connect">
                        <p className="info__name">CON Priority: </p>
                        <p className="info__value">
                          {informationMessages[item].data.CONtyp}
                        </p>
                      </div>
                    ) : (
                      <div className="info__version lan not__connect">
                        <p className="info__name">CON Priority: </p>
                        <p className="info__value">
                          {informationMessages[item].data.CONtyp}
                        </p>
                      </div>
                    )}
                    {/* WHEN CONNECTION TYPE IS WiFi */}
                    {informationMessages[item].data.CONtyp === 3 ? (
                      <div className="info__version wifi connect">
                        <p className="info__name">CON Priority: </p>
                        <p className="info__value">
                          {informationMessages[item].data.CONtyp}
                        </p>
                      </div>
                    ) : (
                      <div className="info__version wifi not__connect">
                        <p className="info__name">CON Priority: </p>
                        <p className="info__value">
                          {informationMessages[item].data.CONtyp}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* WiFi */}
                  <div className="info__group">
                    <div className="info__version">
                      <p className="info__name">WiFi name: </p>
                      <p className="info__value">
                        {informationMessages[item].data.WIF.ssid}
                      </p>
                    </div>
                    <div className="info__version">
                      <p className="info__name">Password: </p>
                      <p className="info__value">
                        {informationMessages[item].data.WIF.password}
                      </p>
                    </div>
                  </div>
                  {/* CONNECTION MODE */}
                  <div className="info__version">
                    <p className="info__name">Connection Mode: </p>
                    {informationMessages[item].data.CHANGEtyp === 0 ? (
                      <p className="info__value">AC</p>
                    ) : (
                      <p className="info__value">BATTERY</p>
                    )}
                  </div>
                </div>
              ) : (
                <></>
              )}
              <button
                className="device_detele"
                onClick={() => handleDeleteDevice(index)}>
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
