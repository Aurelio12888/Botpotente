import TelegramBot from 'node-telegram-bot-api';

export function setupTelegramBot() {
  const token = "8545476612:AAGPgNkxs3ZJSanFGWHg7eWg5l1wL-Xo_oE";
  // Em produção, o usuário deve usar REPLIT_DEV_DOMAIN ou o domínio publicado
  const webAppUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : (process.env.REPLIT_SLUG && process.env.REPLIT_OWNER 
        ? `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_OWNER}.repl.co`
        : "https://seu-app.replit.app");

  const bot = new TelegramBot(token, { polling: { autoStart: true } });

  bot.on('polling_error', (error) => {
    if (error.message.includes('409')) {
      // Ignore conflict errors to allow other instance
    } else {
      console.error("Telegram polling error:", error);
    }
  });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Bem-vindo ao Pocket Broker AI Signal Bot! 🚀\n\nClique no botão abaixo para abrir o WebApp e começar a receber sinais.", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Abrir WebApp",
              web_app: { url: webAppUrl }
            }
          ]
        ]
      }
    });
  });

  console.log("Telegram Bot is running...");
  return bot;
}
