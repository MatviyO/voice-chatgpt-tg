import config from "config";
import {message} from "telegraf/filters";
import {Telegraf} from "telegraf";
import {ogg} from "./ogg";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

// handle input data
bot.on(message('text'), async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2));
})

bot.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);
    } catch (e) {
        console.log(`Error voice message`, e.message)
    }
})

// handle input command
bot.command('start', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2));
})

bot.launch().finally(() => console.log("Bot has been started"));
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
