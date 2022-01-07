'use strict';

const axios = require('axios');

const token = process.env.TOKEN
const baseUrl = "https://api.telegram.org/bot" + token;

function send(messageRequest) {
  try {
    return await axios.post(baseUrl + "/sendMessage", messageRequest);
  } catch (err) {
    console.error("Error occured while sending Telegram message: " + JSON.stringify(err));
    // TODO: maybe throw further?
  }
}

module.exports.receiveMessage = async (event) => {
  console.log("Inbound message received: " + JSON.stringify(event.body));
  const messageRequest = {
    chat_id: event.body.message.chat.id,
    text: JSON.stringify(event.body)
  };
  send(messageRequest);
}

module.exports.sendMessage = async (event) => {
  const input = JSON.parse(event.body);
  const messageRequest = {
    chat_id: input.chatId,
    text: input.message
  };
  send(messageRequest);
}
