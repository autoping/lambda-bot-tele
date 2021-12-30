'use strict';

const AWS = require("aws-sdk");
const uuid = require("uuid");

const TelegramBot = require('node-telegram-bot-api'); // подключаем node-telegram-bot-api

const token = '5064483062:AAHPh_imIdtdZmfaL_xQc2Sk584byqSeAuo'; // тут токен кторый мы получили от botFather

// включаем самого обота
const bot = new TelegramBot(token, {polling: true});


// обработчик события присылания нам любого сообщения
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id; //получаем идентификатор диалога, чтобы отвечать именно тому пользователю, который нам что-то прислал
// console.log(msg);
//     // отправляем сообщение
//     bot.sendMessage(chatId, 'Привет, Друг!');
// });

bot.onText(/\/start/, (msg) => {
    console.log(msg.text)
    const chatId = msg.chat.id;
    var arr = msg.text.split(' ');

    var id = arr[1];

    let result = bot.sendMessage(chatId, "Welcome, user with id "+ id + " chat.id = " + chatId);

    console.log();

});

module.exports.sendMessage = async (event) => {
    const input = JSON.parse(event.body);
    const chatId = input.chatId;
    const message = input.message;


   let result = await bot.sendMessage(chatId, message);

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};
