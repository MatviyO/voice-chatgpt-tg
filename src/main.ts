import config from "config";
import {message} from "telegraf/filters";
import {code} from "telegraf/format";
import {Telegraf, session} from "telegraf";

import {ogg} from "./Ogg";
import { openAI } from "./OpenAI";
import { textConvertor } from "./TextConvertor";
import { ETypeResponse } from "./core/types/ETypeResponse";
import { ITelegrafContext } from "./core/types/ISession";
import { telegram } from "./Telegram";

const initSession = {
    messages: [],
    responseMode: ETypeResponse.TEXT,
}

const bot = new Telegraf<ITelegrafContext>(config.get("TELEGRAM_TOKEN"));

//session
bot.use(session())

// Session initialization middleware
bot.use((ctx, next) => {
    if (ctx && !ctx.session) {
        ctx.session = initSession;
    }
    return next();
});

// handle input data
bot.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code("Waiting..."));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const mp3Path = await ogg.convertOggToMp3(link.href, userId);

        const text = await openAI.transcription(mp3Path);
        await ctx.reply(code(`Your request: ${text}`));

        telegram.addMessageToSession(ctx?.session, openAI.roles.USER, text);
        const responseAi = await openAI.chat(ctx?.session?.messages);
        telegram.addMessageToSession(ctx?.session, openAI.roles.ASSYSTANT, responseAi?.content);

        //if we want response audio
        const source = await textConvertor.textToSpeach(responseAi?.content);
        ctx.sendAudio({source})

    } catch (e) {
        console.log(`Error voice message`, e)
    }
})


bot.on(message('text'), async (ctx) => {
    try {
        await ctx.reply(code("Waiting..."));

        telegram.addMessageToSession(ctx?.session, openAI.roles.USER, ctx.message.text);
        const responseAi = await openAI.chat(ctx?.session?.messages);
        telegram.addMessageToSession(ctx?.session, openAI.roles.ASSYSTANT, responseAi?.content);

        await ctx.reply(String(responseAi?.content));
    } catch (e) {
        console.log(`Error voice message`, e)
    }
})


// handle input command
bot.command('start', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2));
})

bot.command('new', async (ctx) => {
    await ctx.reply("Waiting message...");
})

bot.command('toggleMode', (ctx) => {
    if (ctx.session.responseMode === ETypeResponse.TEXT) {
        ctx.session.responseMode = ETypeResponse.AUDIO;
        ctx.reply("Mode switched to audio.");
    } else {
        ctx.session.responseMode = ETypeResponse.TEXT;
        ctx.reply("Mode switched to text.");
    }
});

bot.command('imageMode', (ctx) => {
    ctx.session.responseMode = ETypeResponse.IMAGE;
    ctx.reply("Mode switched to image.");
});

bot.launch().finally(() => console.log("Bot has been started"));

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
