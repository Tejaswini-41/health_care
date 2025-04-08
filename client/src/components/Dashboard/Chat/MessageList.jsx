import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className="message-item">
          <p>{msg.content}</p>
          <span>{new Date(msg.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;