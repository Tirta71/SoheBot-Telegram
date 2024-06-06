require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require("uuid");

const telegramToken = process.env.TELEGRAM_BOT_API_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

const bot = new TelegramBot(telegramToken, { polling: true });
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateText(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage =
    "Selamat datang, saya KuysoheBot bot telegram yang dibuat oleh Tirta Samara dan sudah terintegrasi dengan Gemini AI.\n\n/help - Melihat menu yang tersedia";
  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
    Berikut adalah menu yang tersedia:
    /start - Memulai interaksi dengan bot
    /help - Melihat menu yang tersedia
    /clear - Menghapus isi chat dengan bot
    /about - Tentang bot ini
    /quote - Mendapatkan kutipan inspiratif
    /meme - Mengirimkan meme acak
  `;
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  const aboutMessage =
    "Saya KuySoheBot, dibuat oleh Tirta Samara untuk membantu Anda. Saya terintegrasi dengan Gemini AI untuk memberikan respons yang cerdas dan berguna.";
  bot.sendMessage(chatId, aboutMessage);
});

bot.onText(/\/quote/, async (msg) => {
  const chatId = msg.chat.id;
  const quote = await generateText("Berikan saya kutipan inspiratif");
  bot.sendMessage(chatId, quote);
});

bot.onText(/\/meme/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get("https://api.imgflip.com/get_memes");
    const memes = response.data.data.memes;
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    const memeMessage = `${randomMeme.name}\n${randomMeme.url}`;
    bot.sendMessage(chatId, memeMessage);
  } catch (error) {
    bot.sendMessage(chatId, "Tidak dapat mengambil meme. Coba lagi nanti.");
  }
});

bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  const clearMessage = "Silakan hapus chat ini secara manual.";
  bot.sendMessage(chatId, clearMessage);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (
    text.startsWith("/start") ||
    text.startsWith("/help") ||
    text.startsWith("/about") ||
    text.startsWith("/quote") ||
    text.startsWith("/meme") ||
    text.startsWith("/clear")
  ) {
    return;
  }

  try {
    const responseText = await generateText(text);
    bot.sendMessage(chatId, responseText);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan. Coba lagi nanti.");
  }
});

bot
  .stopPolling()
  .then(() => {
    console.log("Stopped polling");
    return bot.startPolling();
  })
  .then(() => {
    console.log("Bot is running and started polling for updates.");
  })
  .catch((error) => console.error("Error starting bot:", error));
