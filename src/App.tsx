import { useState, useEffect } from "react";
import io from "socket.io-client";
import * as typ from "./types";

// Connect to the socket server
const socket = io("http://localhost:5000");

function App() {
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
      <h1> Chat App</h1>

      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Type here"
        className="input input-bordered input-primary w-full max-w-xs" />

      <button onClick={editingMessageId ? saveEditedMessage : sendMessage} className="btn btn-primary"> {editingMessageId ? "Save" : "Send"}</button>

      <div className="messages">
        {Array.isArray(messages) &&
          messages.map((message, index) => (
            <div key={index}>
              <strong>{message.message}</strong>{" "}
             
              <button className="btn" onClick={() => handleDeleteMessage(message.id)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Delete
              </button>
              <button onClick={() => handleEditMessage(message.message, message.id)} className="btn btn-primary">Edit</button>

            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
