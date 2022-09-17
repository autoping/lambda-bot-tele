'use strict';

const axios = require('axios');

const token = process.env.TOKEN
const baseUrl = "https://api.telegram.org/bot" + token;


const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB({ region: "eu-central-1" });

async function send(messageRequest) {
  try {
    console.log("Sending message request: " + JSON.stringify(messageRequest));
    return await axios.post(baseUrl + "/sendMessage", messageRequest);
  } catch (err) {
    console.error("Error occured while sending Telegram message: " + JSON.stringify(err));
    throw err;
  }
}

async function updateDialog(chatId, cardId, initiatorId) {
  return await dynamoDB
    .put({
      TableName: "autoping-dialogs",
      Item: {
        chatId: chatId,
        cardId: cardId,
        initiatorId: initiatorId,
      }
    })
    .promise();
}

async function findUser(userId) {
  return await dynamoDB
    .get({
      TableName: "autoping-users",
      Key: {
        id: userId,
      },
    })
    .promise();
}

async function findAsset(assetId) {
  return await dynamoDB
    .get({
      TableName: "autoping-assets",
      Key: {
        id: assetId,
      },
    })
    .promise();
}

async function findCard(cardId) {
  return await dynamoDB
    .get({
      TableName: "autoping-cards",
      Key: {
        id: cardId,
      },
    })
    .promise();
}

module.exports.receiveOutboundMessage = async (event) => {
  console.log("Outbound message received (webhook): " + JSON.stringify(event.body));
  const messageRequest = {
    chat_id: event.body.message.chat.id,
    text: "Autoping Loopback: " + JSON.stringify(event.body)
  };
  await send(messageRequest);
}

module.exports.sendInboundMessage = async (event) => {
  console.log("Inbound message received (from API): " + JSON.stringify(event.body));

  const cardId = event.body.cardId;

  const card = await findCard(cardId);
  console.log("Card: " + JSON.stringify(card));

  const asset = await findAsset(card.assetId);
  console.log("Asset: " + JSON.stringify(asset));

  const user = await findUser(asset.userId);
  console.log("User: " + JSON.stringify(user));

  const chatId = user.chatId;
  const initiatorId = event.body.initiatorId;

  await updateDialog(chatId, cardId, initiatorId);

  const messageRequest = {
    chat_id: chatId,
    text: event.body.text,
    parse_mode: "markdown"
  };
  await send(messageRequest);
}
