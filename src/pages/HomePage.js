import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import "../scss/HomeStyle.scss";

const HomePage = () => {
  // const [message, setMessages] = useState({});
  const [informationMessages, setInformationMessages] = useState({});
  const [emergencyMessage, setEmergencyMessage] = useState({});
  const [topics, setTopics] = useState([
    "server/00097/data",
    "server/00003/data",
    "server/00012/data",
    "server/00108/data",
    "server/00113/data",
    "server/00020/data",
    // "server/050202/data",
  ]);
  const [ismqtt, setIsMqtt] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [test, setTest] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [wifiDeviceId, setWifiDeviceId] = useState("");
  const [ssid, setSSID] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [priDeviceId, setPriDeviceId] = useState("");

  const priArray = [
    { priName: "SIM-LAN-WiFi", pri: [1, 2, 3] },
    { priName: "SIM-WiFi-LAN", pri: [1, 3, 2] },
    { priName: "LAN-WiFi-SIM", pri: [2, 3, 1] },
    { priName: "LAN-SIM-WiFi", pri: [2, 1, 3] },
    { priName: "WiFi-LAN-SIM", pri: [3, 2, 1] },
    { priName: "WiFi-SIM-LAN", pri: [3, 1, 2] },
  ];
  const brokerConfig = {
    host: "103.151.238.68",
    port: 8087,
    protocol: "websockets",
    username: "guest",
    password: "123456a@",
  };

  const brokerUrl = `${brokerConfig.protocol}://${brokerConfig.host}:${brokerConfig.port}`;

  const connectToMqtt = () => {
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
  };
  const handleButtonClick = () => {
    setIsMqtt(true);
  };

  useEffect(() => {
    if (ismqtt) {
      const cleanup = connectToMqtt();
      return cleanup; // This cleanup function will be called when ismqtt becomes false or on component unmount
    }
  }, [ismqtt, topics]);

  //HANDLE TAKE DEVICE'ID INPUT
  const handleDeviceInput = (event) => {
    setDeviceId(event.target.value);
  };

  //HANDLE TAKE CONFIG WIFI INFORMATION
  const handleWifiDevice = (event) => {
    setWifiDeviceId(event.target.value);
  };
  const handleSSID = (event) => {
    setSSID(event.target.value);
  };
  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  //HANDLE TAKE PRIORITY CONFIG INFORMATION
  const handlePriDevice = (event) => {
    setPriDeviceId(event.target.value);
  };

  const handleRadioChange = (value) => {
    setSelectedOption(value);
  };

  //HANDLE CREATE DEVICE
  const handleAddDevice = () => {
    setTopics((preDevice) => [...preDevice, deviceId]);
    setDeviceId("");
  };
  const handleConnectMQTT = () => {
    setIsMqtt(true);
    console.log(ismqtt);
  };

  //HANDLE DELETE DEIVCE
  const handleDeleteDevice = (index) => {
    setTopics((prevTopics) => {
      const newTopics = [...prevTopics];
      newTopics.splice(index, 1);
      return newTopics;
    });
  };

  //HANDLE WIFI CONFIGURATION
  const handleConfigWifi = () => {
    const client = mqtt.connect(brokerUrl, brokerConfig);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      const topic = wifiDeviceId;
      const payload = ` {
        type: wifi,
        deviceId: n_123456,
        data: { ssidName: ${ssid} , password: ${password} },
      }`;

      // Publish the message
      client.publish(topic, payload, (err) => {
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
      setWifiDeviceId("");
      setSSID("");
      setPassword("");
    });
  };

  //HANDLE PRIORITY CONFIGURATION
  const handleConfigPri = () => {
    const client = mqtt.connect(brokerUrl, brokerConfig);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      const topic = priDeviceId;
      const payload = ` {
        type: priority,
        deviceId: n_123456,
        data: { value: [${selectedOption}]},
      }`;

      // Publish the message
      client.publish(topic, payload, (err) => {
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
    setPriDeviceId("");
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
              <button className="create__btn" onClick={handleButtonClick}>
                *
              </button>
            </div>
          </div>
          <div className="header__menu">
            {/* CONFIG WIFI */}
            <div className="config__wifi_box">
              <p className="menu__item">WiFi configuration</p>
              <div className="item__wifi">
                <div className="item__wifi_content">
                  <input
                    placeholder="device/{id}/cmd"
                    value={wifiDeviceId}
                    onChange={handleWifiDevice}
                    className="item__wifi_input"
                  />
                  <input
                    placeholder="enter wifi name"
                    value={ssid}
                    onChange={handleSSID}
                    className="item__wifi_input"
                  />
                  <input
                    placeholder="enter wifi password"
                    value={password}
                    onChange={handlePassword}
                    className="item__wifi_input"
                  />
                  <button
                    className="item__config_btn"
                    onClick={handleConfigWifi}
                  >
                    CONFIG NOW
                  </button>
                </div>
              </div>
            </div>
            {/* CONFIG PRIORITY */}
            <div className="config__pri_box">
              <p className="menu__item">Priority configuration</p>
              <div className="item__pri">
                <div className="item__pri_content">
                  <div className="item__pri_input_container">
                    <input
                      placeholder="device/{id}/cmd"
                      value={priDeviceId}
                      onChange={handlePriDevice}
                      className="item__pri_input"
                    />
                  </div>
                  <div className="item__pri_list">
                    {priArray.map((item, index) => (
                      <div key={index} className="pri__item">
                        <input
                          type="radio"
                          id={item.pri}
                          name="priorityGroup"
                          className="pri__item_checkbox"
                          onChange={() => handleRadioChange(item.pri)}
                        />
                        <label className="pri__item_title">
                          {item.priName}
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    className="item__config_btn"
                    onClick={handleConfigPri}
                  >
                    CONFIG NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {emergency ? <div className="fire">FIRING!!!!!</div> : <></>}
        {test ? <div className="test">TESTING!!!!!</div> : <></>}
      </div>
      {emergency || test ? <div className="alert__box"></div> : <></>}
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
                      <p className="info__value  small__text">
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
                onClick={() => handleDeleteDevice(index)}
              >
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
