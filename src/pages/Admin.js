import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import "../scss/AdminStyle.scss";
import * as XLSX from "xlsx";

//ICONS
import { FaBars, FaInfo, FaPlus, FaWifi } from "react-icons/fa";
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
  const [wifiConfig, setWifiConfig] = useState(false);

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
          setInformationMessages((prevMessages) => ({
            ...prevMessages,
            receivedMessage,
          }));
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
  //HANDLE DELETE DEVICE WHEN FOUND
  const handleDeteleFindDevice = (deviceId) => {
    setDeviceInfo((preDevice) =>
      preDevice.filter((device) => device.deviceInfoId !== deviceId)
    );
    setSearchQuery("");
  };

  //HANDLE WIFI CONFIGURATION
  const handleConfigWifi = () => {
    if (wifiDeviceId !== "") {
      const client = mqtt.connect(brokerUrl, brokerConfig);

      client.on("connect", () => {
        console.log("Connected to MQTT broker");

<<<<<<< HEAD
        const topic = `device/${wifiDeviceId}/cmd`;
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
=======
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
>>>>>>> 27e47eee5dc03d7ee28c3d7a0a9e0a594fdeaa65

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

        const topic = `device/${priDeviceId}/cmd`;
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
<<<<<<< HEAD
          "type": "info",
          "deviceId": "n_123456",
          "data": {},
        }`;
=======
        "type": "priority",
        "deviceId": "n_123456",
        "data": { "value": "[${selectedOption}]"},
      }`;
>>>>>>> 27e47eee5dc03d7ee28c3d7a0a9e0a594fdeaa65
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

  return (
    <div className="admin_container">
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
<<<<<<< HEAD
                </div>
                <div className="create__btn_container">
                  <button className="create__btn" onClick={handleAddDevice}>
                    <p className="create__btn_icon">+</p>
=======
                  <button
                    className="item__config_btn"
                    onClick={handleConfigWifi}
                  >
                    CONFIG NOW
>>>>>>> 27e47eee5dc03d7ee28c3d7a0a9e0a594fdeaa65
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
<<<<<<< HEAD
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
=======
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
                    onClick={handleConfigPri}
                  >
                    CONFIG NOW
                  </button>
>>>>>>> 27e47eee5dc03d7ee28c3d7a0a9e0a594fdeaa65
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
<<<<<<< HEAD
            <div className="device " key={index}>
              <div className="device__headline">
                <p className="device__name">{item}</p>
                <div
                  onClick={() => handleGetInfo(item)}
                  className="device__info_get">
                  <FaInfo />
                </div>
              </div>
=======
            <div
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
>>>>>>> 27e47eee5dc03d7ee28c3d7a0a9e0a594fdeaa65
              <p className="device__name" style={{ marginTop: ".5rem" }}>
                Count Restart: {countReset}
              </p>
              <div
                style={{
                  display: "flex",
                  margin: ".5rem 0rem",
                  gap: ".5rem",
<<<<<<< HEAD
                }}>
                <p className="device__count_reset">Count LAN:{countLAN}</p>
                <p className="device__count_reset">count WIFI:{countWifi}</p>
                <p className="device__count_reset">count SIM:{countSIM}</p>
              </div>
              <button
                className="device_detele"
                onClick={() => handleDeleteDevice(index)}>
                x
              </button>
=======
                }}
              >
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
                    {informationMessages[item].data.BAT.percent > 0 &&
                    informationMessages[item].data.BAT.percent <= 25 ? (
                      <div className="info__value">
                        <p className="bat low">
                          <FaBatteryQuarter />
                        </p>
                        <span className="bat__per">
                          {informationMessages[item].data.BAT.percent}%
                        </span>
                      </div>
                    ) : informationMessages[item].data.BAT.percent > 25 &&
                      informationMessages[item].data.BAT.percent <= 50 ? (
                      <div className="info__value">
                        <p className="bat half__full">
                          <FaBatteryHalf />
                        </p>
                        <span className="bat__per">
                          {informationMessages[item].data.BAT.percent}%
                        </span>
                      </div>
                    ) : informationMessages[item].data.BAT.percent > 50 &&
                      informationMessages[item].data.BAT.percent <= 75 ? (
                      <div className="info__value">
                        <p className="bat quar__full">
                          <FaBatteryThreeQuarters />
                        </p>
                        <span className="bat__per">
                          {informationMessages[item].data.BAT.percent}%
                        </span>
                      </div>
                    ) : informationMessages[item].data.BAT.percent > 75 &&
                      informationMessages[item].data.BAT.percent <= 100 ? (
                      <div className="info__value">
                        <p className="bat full">
                          <FaBatteryFull />
                        </p>
                        <span className="bat__per">
                          {informationMessages[item].data.BAT.percent}%
                        </span>
                      </div>
                    ) : (
                      <p className="info__value">AC</p>
                    )}
                  </div>
                  {/* SD CARD */}
                  <div className="info__version">
                    <p className="info__name">SD Card </p>
                    {isSD ? (
                      <FaCheck className="info__value checked" />
                    ) : (
                      <FaTimes className="info__value not__checked" />
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
                  onClick={() => handleDeleteDevice(index)}
                >
                  x
                </button>
              )}
>>>>>>> 27e47eee5dc03d7ee28c3d7a0a9e0a594fdeaa65
            </div>
          ))}
          <div></div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Admin;
