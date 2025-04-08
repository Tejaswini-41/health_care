import React, { useState, useEffect } from "react";
import { getMessages, sendMessage } from "../../../services/chatService";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./Chat.css";

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Chat ID:", chatId); // Add logging
    const fetchMessages = async () => {
      if (!chatId) {
        console.error("Chat ID is undefined");
        return;
      }
      const data = await getMessages(chatId);
      setMessages(data);
      setLoading(false);
    };

    fetchMessages();
  }, [chatId]);

  const handleSendMessage = async (message) => {
    const newMessage = await sendMessage(chatId, message);
    setMessages([...messages, newMessage]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-window">
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
