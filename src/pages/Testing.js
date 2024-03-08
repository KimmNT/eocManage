import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import * as XLSX from "xlsx";
import "../scss/Test.scss";

//ICONS
import { FaPlus, FaWifi } from "react-icons/fa";
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

const Testing = () => {
  //Message State
  const [informationMessages, setInformationMessages] = useState({});
  const [emergencyMessage, setEmergencyMessage] = useState({});
  const [testMessage, setTestMessage] = useState({});
  const [topics, setTopics] = useState([]);
  const [message, setMessage] = useState([]);

  //Alert State
  const [emergency, setEmergency] = useState(false);
  const [test, setTest] = useState(false);
  const [config, setConfig] = useState(false);
  //Config State
  const [deviceId, setDeviceId] = useState("");
  const [owner, setOwner] = useState("");
  const [deviceInfo, setDeviceInfo] = useState([
    {
      deviceInfoId: "server/40009/data",
      deviceInfoOwner: "no owner",
      deviceAlive: true,
    },
    {
      deviceInfoId: "server/40007/data",
      deviceInfoOwner: "no owner",
      deviceAlive: true,
    },
  ]);
  const [devicePreID, setDevicePreId] = useState("");
  const [wifiDeviceId, setWifiDeviceId] = useState("");
  const [ssid, setSSID] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [priDeviceId, setPriDeviceId] = useState("");
  //Find Device State
  const [searchQuery, setSearchQuery] = useState("");
  const [foundDevice, setFoundDevice] = useState(null);
  //Display when Screen at Mobile size
  const [isVisible, setIsVisible] = useState(false);
  //Keepalive State
  const [isOnline, setIsOnline] = useState(false);
  //Check browser width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

    //Return to False when device offline
    if (isOnline) {
      // const deviceIndex = deviceInfo.findIndex(
      //   (item) => item.deviceInfoId === `server/${message}/data`
      // );
      // console.log(deviceIndex);
      // deviceInfo[deviceIndex].deviceAlive = true;
      // const timeoutKeepAlive = setTimeout(() => {
      //   console.log("TURN TO FALSE");
      //   deviceInfo[deviceIndex].deviceAlive = false;
      //   setIsOnline(false);
      // }, 20000);
      // Clean up the timeout on component unmount
      // return () => clearTimeout(timeoutKeepAlive);
    }
    // Function to update window width
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [searchQuery, isOnline, windowWidth]);

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
      deviceInfo.forEach((topic) => {
        client.subscribe(topic.deviceInfoId, (err) => {
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
        if (receivedMessage !== null) {
          setIsOnline(true);
        }
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
          }, 3000);

          // Clean up the timeout on component unmount
          return () => clearTimeout(timeoutId);
        }
        //FOR CHECKING RESTART
        if (receivedMessage.type === "keepalive") {
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
  }, [deviceInfo, brokerUrl]); // Re-run effect when the topics array changes

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
  const handleDeleteDevice = () => {
    deviceInfo.map((item) => console.log(item));
    console.log(message);
  };
  // const handleDeleteDevice = (index) => {
  //   setDeviceInfo((preDeviceInfo) => {
  //     const newDeviceInfo = [...preDeviceInfo];
  //     newDeviceInfo.splice(index, 1);
  //     return newDeviceInfo;
  //   });
  //   setTopics((preTopic) => {
  //     const newTopic = [...preTopic];
  //     newTopic.splice(index, 1);
  //     return newTopic;
  //   });
  // };
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

          // Disconnect from the MQTT broker
          client.end();
        });
      });
      setWifiDeviceId("");
      setSSID("");
      setPassword("");
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
      setFoundDevice(found.deviceInfoId);
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

  return (
    <div className="container">
      <div className="menu">
        <div className="menu__headline">
          <div className="menu__logo">
            <p className="logo">eoc</p>
          </div>
          <div className="menu__create">
            <div className="create__input_container">
              <input
                placeholder="pre id"
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
            <div className="create__btn" onClick={handleAddDevice}>
              <FaPlus className="create__btn_icon" />
            </div>
          </div>
        </div>
        {/* <div className="menu__list">
          WIFI
          <div className="menu__item">
            <div className="item__icon">
              <div className="item__head"></div>
              <FaWifi className="icon" />
            </div>
            <div className="config__container">
              <div className="config__content">
                <div className="config__input">
                  <input
                    placeholder="enter device's id"
                    value={wifiDeviceId}
                    onChange={handleWifiDevice}
                    className="input__content"
                  />
                  <input
                    placeholder="enter wifi name"
                    value={ssid}
                    onChange={handleSSID}
                    className="input__content"
                  />
                  <input
                    placeholder="enter wifi password"
                    value={password}
                    onChange={handlePassword}
                    className="input__content"
                  />
                </div>
                <div className="config__btn" onClick={handleConfigWifi}>
                  CONFIG NOW
                </div>
              </div>
            </div>
          </div>
          PRIORITY
          <div className="menu__item">
            <div className="item__icon">
              <div className="item__head"></div>

              <FaThList className="icon" />
            </div>
            <div className="config__container">
              <div className="config__content">
                <div className="config__input">
                  <input
                    placeholder="enter device's id"
                    value={priDeviceId}
                    onChange={handlePriDevice}
                    className="input__content"
                  />
                </div>
                <div className="config__list">
                  {priArray.map((item, index) => (
                    <div key={index} className="list__item">
                      <input
                        type="radio"
                        id={item.pri}
                        name="priorityGroup"
                        className="item__checkbox"
                        onChange={() => handleRadioChange(item.pri)}
                      />
                      <label className="item__title">{item.priName}</label>
                    </div>
                  ))}
                </div>
                <div className="config__btn" onClick={handleConfigPri}>
                  CONFIG NOW
                </div>
              </div>
            </div>
          </div>
          IMPORT EXCEL
          <div className="menu__item">
            <div className="item__icon" onClick={handleButtonClick}>
              <div className="item__head"></div>

              <FaFileImport className="icon" />
            </div>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div> */}
      </div>
      <div className="header">
        <div className="header__alert"></div>
      </div>
    </div>
  );
};

export default Testing;
