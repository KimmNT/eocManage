import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import "../scss/AdminStyle.scss";
import * as XLSX from "xlsx";

//ICONS
import {
  FaBars,
  FaEthernet,
  FaInfo,
  FaKey,
  FaPlug,
  FaPlus,
  FaSimCard,
  FaWifi,
} from "react-icons/fa";
import { FaThList } from "react-icons/fa";
import { FaFireAlt } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa";
import { FaFileImport } from "react-icons/fa";
import { FaBatteryFull } from "react-icons/fa";
import { FaBatteryThreeQuarters } from "react-icons/fa";
import { FaBatteryHalf } from "react-icons/fa";
import { FaBatteryQuarter } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

const Admin = () => {
  //Message State
  const [informationMessages, setInformationMessages] = useState({});
  const [emergencyMessage, setEmergencyMessage] = useState({});
  const [testMessage, setTestMessage] = useState({});
  const [topics, setTopics] = useState([]);
  const [keepAliveMessage, setKeeepAliveMesssage] = useState({});
  const [isSD, setIsSD] = useState({});
  //Alert State
  const [emergency, setEmergency] = useState(false);
  const [test, setTest] = useState(false);
  const [config, setConfig] = useState(false);
  //Config State
  const [deviceId, setDeviceId] = useState("");
  const [devicePreID, setDevicePreId] = useState("");
  const [owner, setOwner] = useState("");
  const [deviceInfo, setDeviceInfo] = useState([]);
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
  //Keepalive State
  const [isOnline, setIsOnline] = useState(false);
  //Display when Screen at Mobile size
  const [isVisible, setIsVisible] = useState(false);
  //Check browser width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  //Check config
  const [wifiConfig, setWifiConfig] = useState(0);
  //Change server
  const [deviceIdServer, setDeviceIdServer] = useState("");

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
        client.subscribe(`broker/message/listener/device`, (err) => {
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
          console.log("yeahhu");
          setInformationMessages(receivedMessage);
        }
        //FOR EMERGENCY TYPE
        if (receivedMessage.type === "emergency") {
          setEmergencyMessage(receivedMessage.deviceId);
          setEmergency(true);
          const timeoutId = setTimeout(() => {
            setEmergency(false);
          }, 3000);
          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutId);
        }
        //FOR BUTTON TEST TYPE
        if (receivedMessage.type === "test") {
          setTestMessage(receivedMessage.deviceId);
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
          receivedMessage.SDCard === 1 ? setIsSD(true) : setIsSD(false);
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

          setKeeepAliveMesssage(receivedMessage.deviceId);
          setIsOnline(true);
          const timeoutKeepAlive = setTimeout(() => {
            setTest(false);
          }, 40000);

          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutKeepAlive);
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
    if (deviceId !== "") {
      setTopics((preDevice) => [
        ...preDevice,
        `server/${devicePreID + deviceId}/data`,
      ]);
      setDeviceId("");
      setOwner((preOwner) => [...preOwner, owner]);
      setOwner("");
      const combineDeviceInfo = {
        deviceInfoId: `server/${devicePreID + deviceId}/data`,
        deviceInfoOwner: owner === "" ? "no owner" : owner,
        deviceAlive: false,
      };
      setDeviceInfo([...deviceInfo, combineDeviceInfo]);
      setIsVisible(false);
    } else {
      alert("Haven't enter device'id");
    }
  };

  //HANDLE DELETE DEIVCE
  const handleDeleteDevice = (index) => {
    setDeviceInfo((preDeviceInfo) => {
      const newDeviceInfo = [...preDeviceInfo];
      newDeviceInfo.splice(index, 1);
      return newDeviceInfo;
    });
    setTopics((preTopic) => {
      const newTopic = [...preTopic];
      newTopic.splice(index, 1);
      return newTopic;
    });
  };

  //HANDLE WIFI CONFIGURATION
  const handleConfigWifi = () => {
    if (wifiDeviceId !== "") {
      const client = mqtt.connect(brokerUrl, brokerConfig);

      client.on("connect", () => {
        console.log("Connected to MQTT broker");

        // const topic = `device/${wifiDeviceId}/cmd`;
        const topic = `device/n_${wifiDeviceId}`;
        const payload = `{
        "type": "wifi",
        "deviceId": "n_123456",
        "data": { "ssidName": "${ssid}", "password": "${password}" },
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
      setWifiDeviceId("");
      // setSSID("");
      // setPassword("");
      setConfig(true);
    } else {
      alert("Haven't enter device's id");
    }
  };

  //HANDLE PRIORITY CONFIGURATION
  const handleConfigPri = () => {
    if (priDeviceId !== "") {
      const client = mqtt.connect(brokerUrl, brokerConfig);
      client.on("connect", () => {
        console.log("Connected to MQTT broker");

        // const topic = `device/${priDeviceId}/cmd`;
        const topic = `device/n_${priDeviceId}`;
        const payload = ` {
          "type": "priority",
          "deviceId": "n_123456",
          "data": { "value": "[${selectedOption}]"},
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
      setConfig(true);
    } else {
      alert("Haven't enter device's id");
    }
  };

  //HANDLE FIND DEVICE BY ID
  const handleSearch = () => {
    // Find the device based on the entered ID
    const fixedSearchQuery = `server/${searchQuery}/data`;
    const found = deviceInfo.find(
      (device) => device.deviceInfoId === fixedSearchQuery
    );
    if (found) {
      setFoundDevice(found);
    } else {
      alert("Device not found!");
    }
  };

  //HANDLE IMPORT EXCEL
  const fileInputRef = React.createRef();

  const transformData = (originalData) => {
    return originalData.map((row) => {
      // Assuming row[0] and row[1] are the values from the two columns
      const rowDataObject = {
        deviceInfoId: `server/${row[0]}/data`,
        deviceInfoOwner: row[1] === "" ? "no owner" : row[1], // Ensure the value is converted to a string
      };
      return rowDataObject;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let dataArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        dataArray = transformData(dataArray);

        setDeviceInfo(dataArray);
      } catch (error) {
        console.error("Error reading Excel file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  //HANDLE OPEN BOX WHEN AT MOBILE SIZE
  const handleOpenBox = () => {
    if (windowWidth <= 998) {
      setIsVisible(!isVisible);
    }
  };

  //HANDLE GET INFO
  const handleGetInfo = (deviceId) => {
    const client = mqtt.connect(brokerUrl, brokerConfig);
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      const topic = `device/n_${deviceId.substring(7, 12)}`;
      const payload = ` {
          "type": "info",
          "deviceId": "n_123456",
          "data": {},
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
  };

  //HANDLE CHANGE SERVER
  const handleConfigServer = () => {
    if (deviceIdServer !== "") {
      const client = mqtt.connect(brokerUrl, brokerConfig);
      client.on("connect", () => {
        console.log("Connected to MQTT broker");

        // const topic = `device/${priDeviceId}/cmd`;
        const topic = `device/n_${priDeviceId}`;
        const payload = ` {
          "type": "config",
          "deviceId": "n_123456",
          "data": {
            "host":"14.225.197.82",
            "ip":"14.225.197.82",
            "port":"61285",
            "username":"eocBroker",
            "password":"Vtc@2023"
          },
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
      setDeviceIdServer("");
    } else {
      alert("Haven't enter device's id");
    }
  };

  return (
    <div className="admin_container">
      {/* <div className="count__deivce">
        <p className="count__number">{deviceInfo.length}</p>{" "}
        {deviceInfo.length > 1 ? <p>devices</p> : <p>device</p>}
      </div> */}
      <div className="setting__container">
        <div className="setting__content">
          <div className="setting__icon">
            <FaBars className="icon" />
          </div>
          <div className="setting__config">
            {config ? (
              <div className="config active">
                <FaRegCheckCircle />
              </div>
            ) : (
              <div className="config unactive"></div>
            )}
            <div className="config__content">
              <div className="config__nav">
                {wifiConfig === 1 ? (
                  <>
                    <div
                      className="config__icon"
                      onClick={() => setWifiConfig(0)}
                    >
                      <FaWifi className="icon" />
                    </div>
                    <div className="config__line_vertical"></div>
                    <div
                      className="config__icon active"
                      onClick={() => setWifiConfig(1)}
                    >
                      <FaThList className="icon" />
                    </div>
                    <div className="config__line_vertical"></div>
                    <div
                      className="config__icon"
                      onClick={() => setWifiConfig(2)}
                    >
                      <FaKey className="icon" />
                    </div>
                  </>
                ) : wifiConfig === 0 ? (
                  <>
                    <div
                      className="config__icon active"
                      onClick={() => setWifiConfig(0)}
                    >
                      <FaWifi className="icon" />
                    </div>
                    <div className="config__line_vertical"></div>
                    <div
                      className="config__icon "
                      onClick={() => setWifiConfig(1)}
                    >
                      <FaThList className="icon" />
                    </div>
                    <div className="config__line_vertical"></div>
                    <div
                      className="config__icon"
                      onClick={() => setWifiConfig(2)}
                    >
                      <FaKey className="icon" />
                    </div>
                  </>
                ) : wifiConfig === 2 ? (
                  <>
                    <div
                      className="config__icon"
                      onClick={() => setWifiConfig(0)}
                    >
                      <FaWifi className="icon" />
                    </div>
                    <div className="config__line_vertical"></div>
                    <div
                      className="config__icon "
                      onClick={() => setWifiConfig(1)}
                    >
                      <FaThList className="icon" />
                    </div>
                    <div className="config__line_vertical"></div>
                    <div
                      className="config__icon active"
                      onClick={() => setWifiConfig(2)}
                    >
                      <FaKey className="icon" />
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
              {wifiConfig === 1 ? (
                <div className="config__item">
                  <div className="config__item_content">
                    <input
                      placeholder="enter device's id"
                      value={priDeviceId}
                      onChange={handlePriDevice}
                      className="config__item_input"
                    />
                  </div>
                  <div className="config__item_list">
                    {priArray.map((item, index) => (
                      <div key={index} className="item">
                        <input
                          type="radio"
                          id={item.pri}
                          name="priorityGroup"
                          className="item__input"
                          onChange={() => handleRadioChange(item.pri)}
                        />
                        <label className="item__lable">{item.priName}</label>
                      </div>
                    ))}
                  </div>
                  <div className="config__item_btn" onClick={handleConfigPri}>
                    CONFIG NOW
                  </div>
                </div>
              ) : wifiConfig === 0 ? (
                <div className="config__item">
                  <div className="config__item_content">
                    <input
                      placeholder="enter device's id"
                      value={wifiDeviceId}
                      onChange={handleWifiDevice}
                      className="config__item_input"
                    />
                    <input
                      placeholder="enter wifi name"
                      value={ssid}
                      onChange={handleSSID}
                      className="config__item_input"
                    />
                    <input
                      placeholder="enter wifi password"
                      value={password}
                      onChange={handlePassword}
                      className="config__item_input"
                    />
                  </div>
                  <div className="config__item_btn" onClick={handleConfigWifi}>
                    CONFIG NOW
                  </div>
                </div>
              ) : wifiConfig === 2 ? (
                <div className="config__item">
                  <div className="config__item_content">
                    <input
                      placeholder="enter device's id"
                      value={deviceIdServer}
                      onChange={(e) => setDeviceIdServer(e.target.value)}
                      className="config__item_input"
                    />
                  </div>
                  <div
                    className="config__item_btn"
                    onClick={handleConfigServer}
                  >
                    CHANGE SERVER
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="header">
        <div className="header__content">
          <div className="header__headline">
            <div className="headline__logo">
              <p className="headline__title" onClick={handleOpenBox}>
                eoc
              </p>
              {windowWidth <= 998 ? (
                <div className="plus__icon_mobile">
                  <FaPlus className="plus__icon" />
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* WHEN SCREEN AT MOBILE SIZE */}
            {isVisible ? (
              <div className="headline__create mobile__res">
                <div className="create__input_container">
                  <input
                    placeholder="id"
                    value={devicePreID}
                    onChange={(e) => setDevicePreId(e.target.value)}
                    className="create__device"
                  />
                  <input
                    placeholder="device"
                    value={deviceId}
                    onChange={handleDeviceInput}
                    className="create__device"
                  />
                  <input
                    placeholder="device's owner"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="create__owner"
                  />
                </div>
                <div className="create__btn_container">
                  <button className="create__btn" onClick={handleAddDevice}>
                    <p className="create__btn_icon">+</p>
                  </button>
                  <div className="import__btn" onClick={handleButtonClick}>
                    <FaFileImport className="import__btn_icon" />
                  </div>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            ) : (
              <></>
            )}
            {/* WHEN SCREEN BIGGER THAN MOBEIL SIZE */}
            <div className="headline__create more__than_mobile">
              <div className="create__input_container">
                <input
                  placeholder="id"
                  value={devicePreID}
                  onChange={(e) => setDevicePreId(e.target.value)}
                  className="create__device"
                />
                <input
                  placeholder="device"
                  value={deviceId}
                  onChange={handleDeviceInput}
                  className="create__device"
                />
                <input
                  placeholder="device's owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="create__owner"
                />
              </div>
              <div className="create__btn_container">
                <button className="create__btn" onClick={handleAddDevice}>
                  <p className="create__btn_icon">+</p>
                </button>
                <div className="import__btn" onClick={handleButtonClick}>
                  <FaFileImport className="import__btn_icon" />
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
          <div className="header__search">
            <div className="search__container">
              <div className="search_box">
                <input
                  type="text"
                  placeholder="search for device"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="search__btn" onClick={handleSearch}>
                  <p className="search__btn_icon">
                    <FaSearch />
                  </p>
                </div>
                <div className="clear__btn" onClick={() => setSearchQuery("")}>
                  <p className="clear__btn_icon">
                    <FaChevronLeft />
                  </p>
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
              onClick={() => handleGetInfo(item)}
              className={
                emergency &&
                informationMessages[item] &&
                emergencyMessage === informationMessages[item].deviceId
                  ? "device emergency__alert"
                  : test &&
                    informationMessages[item] &&
                    testMessage === informationMessages[item].deviceId
                  ? "device test__alert"
                  : "device "
              }
              key={index}
            >
              <p className="device__name">{item}</p>
              <p className="device__name" style={{ marginTop: ".5rem" }}>
                Count Restart: {countReset}
              </p>
              <div
                style={{
                  display: "flex",
                  margin: ".5rem 0rem",
                  gap: ".5rem",
                }}
              >
                <p className="device__name">Count LAN:{countLAN}</p>
                <p className="device__name">count WIFI:{countWifi}</p>
                <p className="device__name">count SIM:{countSIM}</p>
              </div>
              {emergency || test ? (
                <></>
              ) : (
                <button
                  className="device_detele"
                  onClick={() => handleDeleteDevice(index)}
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
        {informationMessages.deviceId ? (
          <div className="deivce__info">
            <div className="boxes">
              <div className="deivce__info_box highlight__box">
                <p className="deivce__info_text highlight__text">
                  {informationMessages.deviceId}
                </p>
              </div>
              <div className="deivce__info_box">
                <p className="deivce__info_text">
                  ver:{informationMessages.data.FW_version}
                </p>
              </div>
              <div className="deivce__info_box">
                <p className="deivce__info_text">
                  Priority: {informationMessages.data.conn_priority}
                </p>
                <p className="deivce__info_text">
                  Connected:
                  {informationMessages.data.conn_type === 1 ? (
                    <FaSimCard />
                  ) : informationMessages.data.conn_type === 2 ? (
                    <FaEthernet />
                  ) : (
                    <FaWifi />
                  )}
                </p>
              </div>
            </div>
            <div className="boxes">
              <div className="deivce__info_box">
                <p className="deivce__info_text">
                  <FaSimCard />:
                  {informationMessages.data.sim.state === 1 ? (
                    <FaCheck />
                  ) : (
                    <FaTimes />
                  )}
                </p>
                <p className="deivce__info_text">
                  <FaEthernet />:
                  {informationMessages.data.LAN_state === 1 ? (
                    <FaCheck />
                  ) : (
                    <FaTimes />
                  )}
                </p>
                <p className="deivce__info_text">
                  <FaWifi />:
                  {informationMessages.data.wifi.status === 1 ? (
                    <FaCheck />
                  ) : (
                    <FaTimes />
                  )}
                </p>
                <div className="deivce__info_box more__left">
                  {informationMessages.data.wifi.ssid_name !== "" ? (
                    <span className="deivce__info_text">
                      "{informationMessages.data.wifi.ssid_name}"
                    </span>
                  ) : (
                    <span className="deivce__info_text">empty</span>
                  )}
                </div>
              </div>
              <div className="deivce__info_box">
                <p className="deivce__info_text">
                  {informationMessages.deviceId}
                </p>
                <p className="deivce__info_text">
                  ver:{informationMessages.data.FW_version}
                </p>
              </div>
              <div className="deivce__info_box">
                <p className="deivce__info_text">
                  Priority: {informationMessages.data.conn_priority}
                </p>
                <p className="deivce__info_text">
                  Connected:
                  {informationMessages.data.conn_type === 1 ? (
                    <>SIM</>
                  ) : informationMessages.data.conn_type === 2 ? (
                    <>LAN</>
                  ) : (
                    <>WiFi</>
                  )}
                </p>
              </div>
              <div className="deivce__info_box">
                <p className="deivce__info_text">
                  <FaEthernet />:
                  {informationMessages.data.LAN_state === 1 ? (
                    <FaCheck />
                  ) : (
                    <FaTimes />
                  )}
                </p>
                <p className="deivce__info_text">
                  <FaSimCard />:
                  {informationMessages.data.sim[0].status === 1 ? (
                    <FaCheck />
                  ) : (
                    <FaTimes />
                  )}
                  {/* {[informationMessages.data.sim[0].status]} */}
                </p>
                <p className="deivce__info_text">
                  <FaWifi />:
                  {informationMessages.data.wifi.status === 1 ? (
                    <FaCheck />
                  ) : (
                    <FaTimes />
                  )}
                </p>
                <div className="deivce__info_box more__left">
                  {informationMessages.data.wifi.ssid_name !== "" ? (
                    <span className="deivce__info_text">
                      "{informationMessages.data.wifi.ssid_name}"
                    </span>
                  ) : (
                    <span className="deivce__info_text">empty</span>
                  )}

                  {informationMessages.data.wifi.password !== "" ? (
                    <span className="deivce__info_text">
                      "{informationMessages.data.wifi.password}"
                    </span>
                  ) : (
                    <span className="deivce__info_text">empty</span>
                  )}
                </div>
              </div>
              <div className="deivce__info_box">
                {informationMessages.data.charge_type === 0 ? (
                  <FaPlug className="deivce__info_text" />
                ) : (
                  <p className="deivce__info_text">
                    BAT:
                    <span className="device__percent">
                      {informationMessages.data.battery.percentage}%
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Admin;
