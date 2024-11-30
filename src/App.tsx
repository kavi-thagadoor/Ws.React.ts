import { useState, useEffect } from "react";
import io from "socket.io-client";
import * as typ from "./types";
import './App.css';


// Connect to the socket server
const socket = io("http://localhost:5000");

function App() {
  const chat: boolean = false;

  // Conditional class assignment
  const chatClass = `${chat ? 'chat chat-start' : 'chat chat-end'}`;
  const [messages, setMessages] = useState<typ.GeneralResponse[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null); // Track which message is being edited

  useEffect(() => {
    // Listen for incoming messages
    socket.on("messages", (data) => {
      setMessages(data || []);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("messages");
    };
  }, []);

  const handleDeleteMessage = (id: string) => {
    const request: typ.GeneralResponse = {
      id: id,
      message: '',
    };

    // Emit the deleteMessage event
    socket.emit("deleteMessage", request, (response: typ.GeneralResponse) => {
      if (response.message) {
        // Remove the message from the local state if it's deleted
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== id)
        );
        console.log(response.message);
      }
    });
  };

  const handleEditMessage = (message: string, id: string) => {
    // Set the input field with the message to be edited
    setMessageInput(message);
    setEditingMessageId(id); // Track which message is being edited
  };

  const saveEditedMessage = () => {
    if (editingMessageId && messageInput.trim() !== "") {
      // Emit the editMessage event to save the changes
      const request: typ.GeneralResponse = {
        id: editingMessageId,
        message: messageInput,
      };

      socket.emit("editMessage", request, (response: typ.GeneralResponse) => {
        console.log(response.message);
        setMessageInput(""); // Clear the input field
      });
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      // Emit the message
      const req: typ.chat = {
        message: messageInput,
      };

      socket.emit("message", req, (response: typ.GeneralResponse) => {
        // console.log(response.message);
        // Optionally, add the message to local state after it is successfully sent
        setMessages((prevMessages) => [...prevMessages, response]);
      });

      // Clear the input field
      setMessageInput("");
    }
  };

  return (
    <div className="App">

<div className="messages">
  
        {Array.isArray(messages) &&
          messages.map((message, index) => (
            <div key={index}>
              <div className={chatClass}>
                <div className="chat-header">
                  Lini
                  <time className="text-xs opacity-50"> || 12:45</time>
                </div>
                <div className="chat-bubble chat-bubble-primary">{message.message}</div>
                <div className="chat-footer opacity-50">
                  <ul className="menu-horizontal rounded-box">
                    <li>
                      <a className="tooltip">
                        <svg onClick={() => handleDeleteMessage(message.id)} xmlns="http://www.w3.org/2000/svg" className="h-4 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L6 8m0 10h12M6 8a2 2 0 012-2h8a2 2 0 012 2m-8 0v10m-3-10v10m6-10v10M19 8H5M10 4h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1h-4z" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a className="tooltip">
                        <svg onClick={() => handleEditMessage(message.message, message.id)} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 3.487a1.5 1.5 0 012.121 0l1.53 1.53a1.5 1.5 0 010 2.121l-9.193 9.193a1.5 1.5 0 01-.708.393l-4.5 1a.75.75 0 01-.92-.92l1-4.5a1.5 1.5 0 01.393-.708l9.193-9.193zM10.5 7.5l6 6" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
      </div>


      <div className="left-0 bottom-1 w-full text-black text-center">
        <label className="input input-primary flex items-center gap-2 w-100">
          {/* Input Field */}
          <input
            type="text"
            className="grow"
            placeholder="Message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)} // Update state on input
          />

          {/* Send Icon */}
          <svg
            onClick={editingMessageId ? saveEditedMessage : sendMessage}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 cursor-pointer text-blue-500 hover:text-blue-700"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </label>
      </div>


    </div>
  );
}

export default App;
