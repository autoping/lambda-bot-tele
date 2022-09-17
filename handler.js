'use strict';

const axios = require('axios');

const token = process.env.TOKEN
const baseUrl = "https://api.telegram.org/bot" + token;

const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: "eu-central-1"});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

async function send(messageRequest) {
  try {
    console.log("Sending message request: " + JSON.stringify(messageRequest));
    return await axios.post(baseUrl + "/sendMessage", messageRequest);
  } catch (err) {
    console.error("Error occured while sending Telegram message: " + JSON.stringify(err));
    throw err;
  }
}

async function produce(text, groupId, dedupId) {
  return await sqs
    .sendMessage({
      MessageBody: text,
      MessageGroupId: groupId,
      MessageDeduplicationId: dedupId,
      QueueUrl: "https://sqs.eu-central-1.amazonaws.com/587994125269/sqs-queue-autoping-outbound.fifo"
    })
    .promise();
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

async function findDialog(chatId) {
  return await dynamoDB
    .get({
      TableName: "autoping-dialogs",
      Key: {
        chatId: chatId,
      },
    })
    .promise();
}

module.exports.receiveOutboundMessage = async (event) => {
  console.log("Outbound message received (webhook): " + JSON.stringify(event.body));

  const chatId = event.body.message.chat.id;
  const messageId = chatId + "-" + event.body.update_id;

  const dialog = (await findDialog(chatId)).Item;
  console.log("Dialog: " + JSON.stringify(dialog));

  const cardId = dialog.cardId;
  const initiatorId = dialog.initiatorId;

  const message = {
    id: messageId,
    text: event.body.message.text,
    createdAt: event.body.message.date,
    cardId: cardId,
    initiatorId: initiatorId,
    inbound: false
  };

  const groupId = "" + chatId;
  await produce(JSON.stringify(message), groupId, messageId);

  const messageRequest = {
    chat_id: event.body.message.chat.id,
    text: "Test Loopback: " + JSON.stringify(event.body)
  };
  await send(messageRequest);
}

async function handleInboundMessage(message) {

  console.log("Handling inbound message: " + JSON.stringify(message));

  const cardId = message.cardId;

  const card = (await findCard(cardId)).Item;
  console.log("Card: " + JSON.stringify(card));

  const asset = (await findAsset(card.assetId)).Item;
  console.log("Asset: " + JSON.stringify(asset));

  const user = (await findUser(asset.userId)).Item;
  console.log("User: " + JSON.stringify(user));

  const chatId = user.chatId;
  const initiatorId = message.initiatorId;

  await updateDialog(chatId, cardId, initiatorId);

  const messageRequest = {
    chat_id: chatId,
    text: message.text,
    parse_mode: "markdown"
  };

  return send(messageRequest);
}

module.exports.handleInboundMessageHttp = async (event) => {
  const message = event.body;
  console.log("Inbound message received (from API): " + JSON.stringify(message));
  await handleInboundMessage(message);  
}

module.exports.handleInboundMessageSqs = async (event) => {
  const records = event.Records;
  for (var i = 0; i < records.length; i++) {
    const message = JSON.parse(records[i].body);
    console.log("Inbound message received (from SQS): " + JSON.stringify(message));
    await handleInboundMessage(message);
  }
}
