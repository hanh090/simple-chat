import React, { useEffect, useState, useRef } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

function Chat({ socket, username, room, roomChatData }) {
  // USESTATE
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState(roomChatData);

  // USEREF
  const bottomRef = useRef(null);

  // USEEFFECT
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  useEffect(() => {
    // scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  // FUNCTIONS
  const sendMessage = async () => {
    if (currentMessage) {
      const messageData = {
        room: room,
        sender: username,
        message: currentMessage,
      };

      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  const logout = () => {
    localStorage.removeItem('userInformation');
    window.location.reload();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button onClick={logout} className="logout-button">
          Exit
        </button>
        <p>Room {room}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container" ref={bottomRef}>
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.sender ? 'you' : 'other'}
              >
                <div>
                  {username !== messageContent.sender && (
                    <div className="message-meta">
                      <p id="author">{messageContent.sender}</p>
                    </div>
                  )}
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Message here..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === 'Enter' && sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className={currentMessage && 'active-button'}
        >
          &#9658;
        </button>
      </div>
    </div>
  );
}

export default Chat;
