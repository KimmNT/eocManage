import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import "../scss/AdminStyle.scss";

//ICONS
import { FaWifi } from "react-icons/fa";
import { FaThList } from "react-icons/fa";
import { FaFireAlt } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa";

const Admin = () => {
  //Message State
  const [informationMessages, setInformationMessages] = useState({});
  const [emergencyMessage, setEmergencyMessage] = useState({});
  const [testMessage, setTestMessage] = useState({});
  const [topics, setTopics] = useState([]);
  //Alert State
  const [emergency, setEmergency] = useState(false);
  const [test, setTest] = useState(false);
  const [config, setConfig] = useState(false);
  //Config State
  const [deviceId, setDeviceId] = useState("");
  const [wifiDeviceId, setWifiDeviceId] = useState("");
  const [ssid, setSSID] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [priDeviceId, setPriDeviceId] = useState("");
  //Find Device State
  const [searchQuery, setSearchQuery] = useState("");
  const [foundDevice, setFoundDevice] = useState(null);
  //Reset Count State
  const [countReset, setCountReset] = useState(0);
  const [countLAN, setCountLAN] = useState(0);
  const [countWifi, setCountWifi] = useState(0);
  const [countSIM, setCountSIM] = useState(0);

  const priArray = [
    { priName: "SIM-LAN-WiFi", pri: [1, 2, 3] },
    { priName: "SIM-WiFi-LAN", pri: [1, 3, 2] },
    { priName: "LAN-WiFi-SIM", pri: [2, 3, 1] },
    { priName: "LAN-SIM-WiFi", pri: [2, 1, 3] },
    { priName: "WiFi-LAN-SIM", pri: [3, 2, 1] },
    { priName: "WiFi-SIM-LAN", pri: [3, 1, 2] },
  ];

  //BROKER CONFIG
  const brokerConfig = {
    host: "103.151.238.68",
    port: 8087,
    protocol: "websockets",
    username: "guest",
    password: "123456a@",
  };

  //BROKER URL
  const brokerUrl = `${brokerConfig.protocol}://${brokerConfig.host}:${brokerConfig.port}`;

  //FOR FIND DEVICE BY ID
  useEffect(() => {
    // Clear the found device when searchQuery changes
    setFoundDevice(null);
  }, [searchQuery]);

  //FOR RESET CONFIG TO FALSE
  useEffect(() => {
    let configTimeout;

    if (config) {
      configTimeout = setTimeout(() => {
        setConfig(false);
      }, 3000);
    }

    // Cleanup function for useEffect
    return () => {
      clearTimeout(configTimeout);
    };
  }, [config]); // Dependency array to re-run effect when 'config' changes

  //FOR CUMMUNICATE WITH MQTT - BROKER
  useEffect(() => {
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
        if (receivedMessage.type === "info") {
          setInformationMessages((prevMessages) => ({
            ...prevMessages,
            [topic]: receivedMessage,
          }));
        }
        //FOR EMERGENCY TYPE
        if (receivedMessage.type === "emergency") {
          setEmergencyMessage(receivedMessage.id);
          setEmergency(true);
          const timeoutId = setTimeout(() => {
            setEmergency(false);
          }, 3000);

          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutId);
        }
        //FOR BUTTON TEST TYPE
        if (receivedMessage.type === "test") {
          setTestMessage(receivedMessage.id);
          setTest(true);
          const timeoutId = setTimeout(() => {
            setTest(false);
          }, 2000);

          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutId);
        }
        //FOR CHECKING RESTART
        if (receivedMessage.type === "start_program") {
          setCountReset((prevCountReset) => prevCountReset + 1);
          const date = new Date();
          const day = date.getDate();
          const month = date.getUTCMonth();
          const second = date.getSeconds();
          const minute = date.getMinutes();
          const hour = date.getHours();
          const fullDay = `${hour}:${minute}:${second} - ${day}/${month + 1}`;
          console.log(fullDay);
        }
        //FOR CHECKING RESTART
        if (receivedMessage.type === "keepalive") {
          const date = new Date();
          const day = date.getDate();
          const month = date.getUTCMonth();
          const second = date.getSeconds();
          const minute = date.getMinutes();
          const hour = date.getHours();
          const fullDay = `${hour}:${minute}:${second} - ${day}/${month + 1}`;
          console.log(fullDay);
        }
        //FOR ERROR TYPE
        if (receivedMessage.type === "error") {
          const date = new Date();
          const day = date.getDate();
          const month = date.getUTCMonth();
          const second = date.getSeconds();
          const minute = date.getMinutes();
          const hour = date.getHours();
          const fullDay = `${hour}:${minute}:${second} - ${day}/${month + 1}`;
          console.log(fullDay);
          if (
            receivedMessage.data.type === "conn_type" &&
            receivedMessage.data.value === "LAN"
          ) {
            setCountLAN((preCountLAN) => preCountLAN + 1);
          } else if (
            receivedMessage.data.type === "conn_type" &&
            receivedMessage.data.value === "WIFI"
          ) {
            setCountWifi((preCountWifi) => preCountWifi + 1);
          } else if (
            receivedMessage.data.type === "conn_type" &&
            receivedMessage.data.value === "SIM"
          ) {
            setCountSIM((preCountSIM) => preCountSIM + 1);
          }
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
  }, [topics, brokerUrl]); // Re-run effect when the topics array changes

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
    setTopics((preDevice) => [...preDevice, `server/${deviceId}/data`]);
    setDeviceId("");
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

      const topic = `device/${wifiDeviceId}/cmd`;
      const payload = `{
        "type": "wifi",
        "deviceId": "n_123456",
        "data": { "ssidName": "${ssid}", "password": "${password}" },
      }`;
      // const payload = `{
      //   type: wifi,
      //   deviceId: n_123456,
      //   data: { ssidName: ${ssid}, password: ${password} },
      // }`;

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
    setWifiDeviceId("");
    setSSID("");
    setPassword("");
    setConfig(true);
    topics.map((item) => console.log(item));
  };

  //HANDLE PRIORITY CONFIGURATION
  const handleConfigPri = () => {
    const client = mqtt.connect(brokerUrl, brokerConfig);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      const topic = `device/${priDeviceId}/cmd`;
      const payload = ` {
        "type": "priority",
        "deviceId": "n_123456",
        "data": { "value": "[${selectedOption}]"},
      }`;
      // const payload = ` {
      //   type: priority,
      //   deviceId: n_123456,
      //   data: { value: [${selectedOption}]},
      // }`;

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
    setConfig(true);
  };

  return (
    <div className="admin_container">
      <div className="header">
        <div className="header__content">
          <div className="header__headline">
            <p className="headline__title">admin</p>
            <div className="headline__create">
              <input
                placeholder="add new device"
                value={deviceId}
                onChange={handleDeviceInput}
                className="create__input"
              />
              <button className="create__btn" onClick={handleAddDevice}>
                <p className="create__btn_icon">+</p>
              </button>
            </div>
          </div>
          <div className="header__menu">
            {/* CONFIG WIFI */}
            <div className="config__wifi_box">
              <div className="config__icon_container">
                <FaWifi className="config__icon" />
              </div>
              <div className="item__wifi">
                <div className="item__wifi_content">
                  <input
                    placeholder="enter device's id"
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
                    onClick={handleConfigWifi}>
                    CONFIG NOW
                  </button>
                </div>
              </div>
            </div>
            {/* CONFIG PRIORITY */}
            <div className="config__pri_box">
              <div className="config__icon_container">
                <FaThList className="config__icon" />
              </div>
              <div className="item__pri">
                <div className="item__pri_content">
                  <div className="item__pri_input_container">
                    <input
                      placeholder="enter device's id"
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
                    onClick={handleConfigPri}>
                    CONFIG NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {emergency ? (
          <div className="fire">
            <FaFireAlt /> <p className="alert__id">{emergencyMessage}</p>
          </div>
        ) : (
          <></>
        )}
        {test ? (
          <div className="test">
            <FaBell /> <p className="alert__id">{testMessage}</p>
          </div>
        ) : (
          <></>
        )}
        {config ? (
          <div className="config">
            <FaRegCheckCircle />
          </div>
        ) : (
          <></>
        )}
        {emergency || test || config ? (
          <></>
        ) : (
          <div className="header__bottom_width"></div>
        )}
      </div>
      {emergency || test || config ? (
        <div className="alert__box"></div>
      ) : (
        <div className="alert__box_unactive"></div>
      )}
      <div className="content">
        <div className="device__list">
          {topics.map((item, index) => (
            <div
              className={
                emergency &&
                informationMessages[item] &&
                emergencyMessage === informationMessages[item].id
                  ? "device emergency__alert"
                  : test &&
                    informationMessages[item] &&
                    testMessage === informationMessages[item].id
                  ? "device test__alert"
                  : "device"
              }
              key={index}>
              <p className="device__name">{item}</p>
              <p className="device__name" style={{ marginTop: ".5rem" }}>
                Count Restart: {countReset}
              </p>
              <div
                style={{
                  display: "flex",
                  margin: ".5rem 0rem",
                  gap: ".5rem",
                }}>
                <p className="device__name">Count LAN:{countLAN}</p>
                <p className="device__name">count WIFI:{countWifi}</p>
                <p className="device__name">count SIM:{countSIM}</p>
              </div>
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
                </div>
              ) : (
                <div className="welcome">
                  <div className="welcome__content">
                    <p className="welcome__text">Connecting to device</p>
                    <p className="welcome__text">Please wait a moment</p>
                  </div>
                </div>
              )}
              {emergency || test ? (
                <></>
              ) : (
                <button
                  className="device_detele"
                  onClick={() => handleDeleteDevice(index)}>
                  x
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
