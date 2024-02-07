import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import "../scss/HomeStyle.scss";
import { Link } from "react-router-dom";

const HomePage = () => {
  // const [message, setMessages] = useState({});
  const [informationMessages, setInformationMessages] = useState({});
  const [emergencyMessage, setEmergencyMessage] = useState({});
  const [topics, setTopics] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [test, setTest] = useState(false);

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
        //FOR EMERGENCY TYPE
        if (receivedMessage.type === "emergency") {
          setEmergencyMessage((prevMessages) => ({
            ...prevMessages,
            [topic]: receivedMessage,
          }));
          setEmergency(true);
          const timeoutId = setTimeout(() => {
            setEmergency(false);
          }, 5000);

          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutId);
        }
        //FOR BUTTON TEST TYPE
        if (receivedMessage.type === "button_test") {
          setTest(true);
          const timeoutId = setTimeout(() => {
            setTest(false);
          }, 5000);

          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutId);
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
        {emergency ? <div className="fire">FIRING!!!!!</div> : <></>}
        {test ? <div className="test">TESTING!!!!!</div> : <></>}
      </div>
      <div className="content">
        <div className="device__list">
          {topics.map((item, index) => (
            <div className="device" key={index}>
              {item === "server/00097/data" ? (
                <p className="device__name">{item} - Thin</p>
              ) : item === "server/00003/data" ? (
                <p className="device__name">{item} - A.Đăng</p>
              ) : item === "server/00012/data" ? (
                <p className="device__name">{item} - Tứn Eng</p>
              ) : item === "server/00108/data" ? (
                <p className="device__name">{item} - A.Thịn</p>
              ) : item === "server/00113/data" ? (
                <p className="device__name">{item} - A.Ruy</p>
              ) : item === "server/00020/data" ? (
                <p className="device__name">{item} - Tứn Ang</p>
              ) : item === "server/050202/data" ? (
                <p className="device__name">{item} - Tứn Ang</p>
              ) : (
                <p className="device__name">{item}</p>
              )}
              {informationMessages[item] ? (
                <div className="device__info">
                  {/* VERSION */}
                  <div className="info__version">
                    <p className="info__name">Version </p>
                    <p className="info__value">
                      {informationMessages[item].data.FWver}
                    </p>
                  </div>
                  <div className="line"></div>
                  {/* CONNECTION TYPE - PRIORITY */}
                  <div className="info__connection">
                    <p className="info__name">Connection type</p>
                    <div className="info__conpri">
                      {JSON.stringify(informationMessages[item].data.CONpri) ===
                      JSON.stringify([1, 2, 3]) ? (
                        <>
                          {informationMessages[item].data.CONtyp === 1 ? (
                            <div className="conpri__list">
                              <p className="info__value active">SIM</p>
                              <p className="info__value ">LAN</p>
                              <p className="info__value ">WiFi</p>
                            </div>
                          ) : informationMessages[item].data.CONtyp === 2 ? (
                            <div className="conpri__list">
                              <p className="info__value ">SIM</p>
                              <p className="info__value active">LAN</p>
                              <p className="info__value ">WiFi</p>
                            </div>
                          ) : (
                            <div className="conpri__list">
                              <p className="info__value ">SIM</p>
                              <p className="info__value ">LAN</p>
                              <p className="info__value active">WiFi</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {JSON.stringify(informationMessages[item].data.CONpri) ===
                      JSON.stringify([1, 3, 2]) ? (
                        <>
                          {informationMessages[item].data.CONtyp === 1 ? (
                            <div className="conpri__list">
                              <p className="info__value active">SIM</p>
                              <p className="info__value ">WiFi</p>
                              <p className="info__value ">LAN</p>
                            </div>
                          ) : informationMessages[item].data.CONtyp === 2 ? (
                            <div className="conpri__list">
                              <p className="info__value ">SIM</p>
                              <p className="info__value ">WiFi</p>
                              <p className="info__value active">LAN</p>
                            </div>
                          ) : (
                            <div className="conpri__list">
                              <p className="info__value ">SIM</p>
                              <p className="info__value active">WiFi</p>
                              <p className="info__value ">LAN</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {JSON.stringify(informationMessages[item].data.CONpri) ===
                      JSON.stringify([2, 1, 3]) ? (
                        <>
                          {informationMessages[item].data.CONtyp === 2 ? (
                            <div className="conpri__list">
                              <p className="info__value active">LAN</p>
                              <p className="info__value ">SIM</p>
                              <p className="info__value ">WiFi</p>
                            </div>
                          ) : informationMessages[item].data.CONtyp === 1 ? (
                            <div className="conpri__list">
                              <p className="info__value ">LAN</p>
                              <p className="info__value active">SIM</p>
                              <p className="info__value ">WiFi</p>
                            </div>
                          ) : (
                            <div className="conpri__list">
                              <p className="info__value ">LAN</p>
                              <p className="info__value ">SIM</p>
                              <p className="info__value active">WiFi</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {JSON.stringify(informationMessages[item].data.CONpri) ===
                      JSON.stringify([2, 3, 1]) ? (
                        <>
                          {informationMessages[item].data.CONtyp === 1 ? (
                            <div className="conpri__list">
                              <p className="info__value ">LAN</p>
                              <p className="info__value ">WiFi</p>
                              <p className="info__value active">SIM</p>
                            </div>
                          ) : informationMessages[item].data.CONtyp === 2 ? (
                            <div className="conpri__list">
                              <p className="info__value active">LAN</p>
                              <p className="info__value ">WiFi</p>
                              <p className="info__value ">SIM</p>
                            </div>
                          ) : (
                            <div className="conpri__list">
                              <p className="info__value ">LAN</p>
                              <p className="info__value active">WiFi</p>
                              <p className="info__value ">SIM</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {JSON.stringify(informationMessages[item].data.CONpri) ===
                      JSON.stringify([3, 1, 2]) ? (
                        <>
                          {informationMessages[item].data.CONtyp === 1 ? (
                            <div className="conpri__list">
                              <p className="info__value ">WiFi</p>
                              <p className="info__value active">SIM</p>
                              <p className="info__value ">LAN</p>
                            </div>
                          ) : informationMessages[item].data.CONtyp === 2 ? (
                            <div className="conpri__list">
                              <p className="info__value ">WiFi</p>
                              <p className="info__value ">SIM</p>
                              <p className="info__value active">LAN</p>
                            </div>
                          ) : (
                            <div className="conpri__list">
                              <p className="info__value active">WiFi</p>
                              <p className="info__value ">SIM</p>
                              <p className="info__value ">LAN</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {JSON.stringify(informationMessages[item].data.CONpri) ===
                      JSON.stringify([3, 2, 1]) ? (
                        <>
                          {informationMessages[item].data.CONtyp === 1 ? (
                            <div className="conpri__list">
                              <p className="info__value ">WiFi</p>
                              <p className="info__value ">LAN</p>
                              <p className="info__value active">SIM</p>
                            </div>
                          ) : informationMessages[item].data.CONtyp === 2 ? (
                            <div className="conpri__list">
                              <p className="info__value ">WiFi</p>
                              <p className="info__value active">LAN</p>
                              <p className="info__value ">SIM</p>
                            </div>
                          ) : (
                            <div className="conpri__list">
                              <p className="info__value active">WiFi</p>
                              <p className="info__value ">LAN</p>
                              <p className="info__value ">SIM</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div className="line"></div>
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
                  <div className="line"></div>
                  {/* CONNECTION MODE */}
                  <div className="info__version">
                    <p className="info__name">Connection Mode: </p>
                    {informationMessages[item].data.CHANGEtyp === 0 ? (
                      <p className="info__value">AC</p>
                    ) : (
                      <p className="info__value">BATTERY</p>
                    )}
                  </div>
                  {emergency &&
                  emergencyMessage[item] &&
                  informationMessages[item] &&
                  emergencyMessage[item].id === informationMessages[item].id ? (
                    <p>{emergencyMessage[item].id}</p>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <div className="welcome">
                  <div className="welcome__content">
                    <p className="welcome__text">Connecting to device</p>
                    <p className="welcome__text">Please wait a moment</p>
                  </div>
                </div>
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
