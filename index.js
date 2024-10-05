const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options.js')
const sequelize = require('./db.js')
const UserModel = require('./models.js')

const token = '7740081656:AAHvX66yO_BUPRGgLS2tb2nMH7RWf7ifwys'
const chats = {}

const bot = new TelegramApi(token, { polling: true }) // запускаем бота в режиме прослушивания

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, "I choose a number from 0 to 9 and you have to guess it")
    let randNum = Math.floor(Math.random() * 10)
    chats[chatId] = randNum
    console.log(randNum)
    await bot.sendMessage(chatId, "Guess the number", gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (error) {
        console.log("Connection error: " + error);
    }

    bot.setMyCommands([
        { command: '/start', description: 'Start bot' },
        { command: '/info', description: 'Get user info' },
        { command: '/game', description: 'Start game' },
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await UserModel.create({ chatId });
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/0eb/bdf/0ebbdf11-24fb-4e02-8fd0-b085d6d5401d/3.webp');
                return await bot.sendMessage(chatId, "Hello, " + msg.from.first_name + "! Welcome to my bot");
            }
            if (text === '/info') {
                const user = await UserModel.findOne({ chatId });
                return await bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${(msg.from.last_name || '')} \n You have ${user.rightAnswers} right answers and ${user.wrongAnswers} wrong answers`);
            }
            if (text === '/game'){
                return startGame(chatId);
            }
            return await bot.sendMessage(chatId, "I don't understand you");
        } catch (error) {
            return await bot.sendMessage(chatId, "Error: " + error.message);
        }
    })
}

bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
        return startGame(chatId);
    }
    const user = UserModel.findOne({ chatId });
    if (data == chats[chatId]) {
        user.rightAnswers++;
        await bot.sendMessage(chatId, "You are right", againOptions);
    } else {
        user.wrongAnswers++;
        await bot.sendMessage(chatId, "You are wrong" + "\n" + "The right answer is " + chats[chatId], againOptions);
    }
    await user.save();
})

start();