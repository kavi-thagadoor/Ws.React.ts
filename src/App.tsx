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
        console.log(response.message);
        // Optionally, add the message to local state after it is successfully sent
        setMessages((prevMessages) => [...prevMessages, response]);
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

      <button onClick={editingMessageId ? saveEditedMessage : sendMessage}>
        {editingMessageId ? "Save" : "Send"}
      </button>

      <div className="messages">
        {Array.isArray(messages) &&
          messages.map((message, index) => (
            <div key={index}>
              <strong>{message.message}</strong>{" "}
              <button onClick={() => handleDeleteMessage(message.id)}>
                Delete
              </button>
              <button onClick={() => handleEditMessage(message.message, message.id)}>
                Edit
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
