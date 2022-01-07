'use strict';

const axios = require('axios');

const token = process.env.TOKEN
const baseUrl = "https://api.telegram.org/bot" + token;

module.exports.sendMessage = async (event) => {

  const input = JSON.parse(event.body);
  const sendMessageRequest = {
    chat_id: input.chatId,
    text: input.message
  };

  console.log("SendMessage request received: " + JSON.stringify(sendMessageRequest));

  try {
    const result = await axios.post(baseUrl, sendMessageRequest);
    return {
      statusCode: 201,
      body: result
    }
  } catch (err) {
    console.error("Error occured while sending Telegram message: " + JSON.stringify(err));
    return {
      statusCode: 400,
      body: err.description
    }
  }
}
