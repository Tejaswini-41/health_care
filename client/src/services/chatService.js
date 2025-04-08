import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat';

export const getMessages = async (chatId) => {
  const token = localStorage.getItem('token');
  console.log('Fetching messages for chatId:', chatId); // Add logging
  const response = await axios.get(`${API_URL}/messages/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const sendMessage = async (chatId, message) => {
  const token = localStorage.getItem('token');
  console.log('Sending message to chatId:', chatId, 'Message:', message); // Add logging
  const response = await axios.post(
    `${API_URL}/messages/${chatId}`,
    { message },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};