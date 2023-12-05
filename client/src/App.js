import "./App.css";
import io from "socket.io-client";
import { isEmpty } from "lodash";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import FormValidation, { required, roomPattern } from "./utils/FormValidation";
import { getLocalStorage, setLocalStorageItem } from "./utils/Chat.helper";

const socket = io.connect("http://localhost:5000");

const App = () => {
  // Get data from localstorage
  const userData = getLocalStorage("userInformation");

  // USESTATE
  const [formInput, setFormInput] = useState({
    username: "",
    room: "",
  });
  const [showChat, setShowChat] = useState(false);
  const [roomChatData, setRoomChatData] = useState([]);
  const [error, setError] = useState(null);

  // FUNCTIONS
  const joinRoom = () => {
    const { errors } = FormValidation({
      validationRules: {
        username: [required],
        room: [required, roomPattern],
      },
      formInput,
    });
    setError(errors);
    if (formInput.username && formInput.room && isEmpty(errors)) {
      socket.emit(
        "join",
        { username: formInput.username, room: formInput.room },
        (error) => {
          if (error) {
            setError({ username: error });
          } else {
            setLocalStorageItem("userInformation", {
              username: formInput.username,
              room: formInput.room,
            });
            setShowChat(true);
          }
        }
      );
    }
  };

  // USEEFFECT
  useEffect(() => {
    // Check if user is loggin in current browser
    if (userData) {
      socket.emit(
        "join",
        { username: userData.username, room: userData.room },
        (error) => {
          if (error) {
            console.log(error);
          } else {
            setShowChat(true);
          }
        }
      );
    }
  }, []);

  // Get data in chat room
  useEffect(() => {
    socket.on("sendingRoomChatData", (data) => {
      setRoomChatData(data);
    });
  }, [socket]);

  return (
    <div className="App">
      {!showChat ? (
        <div className="chat-container">
          <h3>Join Chatroom</h3>
          <input
            type="text"
            placeholder="Username..."
            onChange={(event) => {
              setFormInput({ ...formInput, username: event.target.value });
            }}
          />
          {!isEmpty(error) && (
            <span style={{ color: "#f55b5b" }}>{error.username}</span>
          )}
          <input
            type="text"
            placeholder="RoomID..."
            onChange={(event) => {
              setFormInput({ ...formInput, room: event.target.value });
            }}
          />
          {!isEmpty(error) && (
            <span style={{ color: "#f55b5b" }}>{error.room}</span>
          )}
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <Chat
          socket={socket}
          username={formInput.username || userData.username}
          room={formInput.room || userData.room}
          roomChatData={roomChatData}
        />
      )}
    </div>
  );
};

export default App;
