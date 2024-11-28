import { useState, useEffect } from "react";
import io from "socket.io-client";
import * as typ from "./types";

const socket = io("http://localhost:5000");

function App() {
  const [messages, setMessages] = useState<typ.GeneralResponse[]>([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    socket.on("messages", (data) => {     
      setMessages(data || []);
    });
  }, []);
  
  const handleDeleteMessage = (id: string) => {
    const request: typ.GeneralResponse = {
      id:id
    }
    socket.emit("deleteMessage", request, (response: typ.GeneralResponse) => {
      console.log(response.message)
     });
  }

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      // Emit the message and provide a callback
      const req: typ.chat = {
        message: messageInput
      }
      socket.emit("message", req, (response: typ.GeneralResponse) => {
       console.log(response.message)
      });

      // Clear the input field
      setMessageInput("");
    }
  };

  return (
    <div className="App">
      <h1>Simple Chat App</h1>

      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Type your message..."
      />

      <button onClick={sendMessage}>Send</button>

      <div className="messages">
        {Array.isArray(messages) &&
          messages.map((message, index) => (
            <div key={index}>
              <strong>{message.message}</strong>   <button onClick={() => handleDeleteMessage(message.id)} >Delete  </button>
            </div>
          ))}
      </div>


    </div>
  );
}

export default App;
