'use strict';

const AWS = require("aws-sdk");
const uuid = require("uuid");
const {Telegraf} = require('telegraf')

const token = '5064483062:AAHPh_imIdtdZmfaL_xQc2Sk584byqSeAuo'; // тут токен кторый мы получили от botFather
const bot = new Telegraf(token);

bot.start((ctx) => {
    let from = ctx.message.from;
    let text = ctx.message.text;
    let uid = text.split(' ')[1];

    ctx.reply('Welcome ' + from.first_name);
    if (uid) {
        ctx.reply('You are linked to this bot successfuly. Id is ' + uid);
    }
    if (!uid) {
        ctx.reply('Can not link, there is no id');
    }


});
bot.help((ctx) =>
    ctx.reply('I m an autoping telegram bot. I will message you if someone want to. Now i understand only /start command. I can not answer back. '));
bot.on('text', ctx => ctx.reply('Sorry, did not understand you'));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


module.exports.sendMessage = async (event) => {
    const input = JSON.parse(event.body);
    const chatId = input.chatId;
    const message = input.message;


    let result = await bot.telegram.sendMessage(chatId, message);

    //todo handle errors
    result.catch(reason => {
        console.log(reason);
    });
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    };
};
