'use strict';

const axios = require('axios');

const token = process.env.TOKEN
const baseUrl = "https://api.telegram.org/bot" + token;

async function send(messageRequest) {
  try {
    console.log("Sending message request: " + JSON.stringify(messageRequest));
    return await axios.post(baseUrl + "/sendMessage", messageRequest);
  } catch (err) {
    console.error("Error occured while sending Telegram message: " + JSON.stringify(err));
    throw err;
  }
}

module.exports.receiveMessage = async (event) => {
  console.log("Inbound message received: " + JSON.stringify(event.body));
  const messageRequest = {
    chat_id: event.body.message.chat.id,
    text: "Autoping Loopback: " + JSON.stringify(event.body)
  };
  await send(messageRequest);
}

module.exports.sendMessage = async (event) => {
  console.log("Outbound message received: " + JSON.stringify(event.body));
  const messageRequest = {
    chat_id: event.body.chatId,
    text: event.body.text
  };
  await send(messageRequest);
}
