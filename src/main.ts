import config from "config";
import {message} from "telegraf/filters";
import {code} from "telegraf/format";
import {Telegraf, session} from "telegraf";
import {ogg} from "./ogg";
import { openAI } from "./openAI";
import { textConvertor } from "./TextConvertor";


const initSession = {
    messages: [],
}

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

//session
bot.use(session())

// handle input data
bot.on(message('text'), async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2));
})

bot.on(message('voice'), async (ctx) => {
    // @ts-ignore
    ctx?.session = initSession;
    try {
        await ctx.reply(code("Waiting..."));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);

        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);
        const text = await openAI.transcription(mp3Path);
        await ctx.reply(code(`Your request: ${text}`));

        // @ts-ignore
        ctx?.session?.messages?.push({ role: openAI.roles.USER, content: text});
        // @ts-ignore
        const responseAi = await openAI.chat(ctx?.session?.messages);
        // @ts-ignore
        ctx?.session?.messages?.push({ role: openAI.roles.ASSYSTANT, content: responseAi?.content});
        await ctx.reply(String(responseAi?.content));

    } catch (e) {
        console.log(`Error voice message`, e)
    }
})


bot.on(message('text'), async (ctx) => {
    // @ts-ignore
    ctx?.session = initSession;
    try {
        await ctx.reply(code("Waiting..."));

        // @ts-ignore
        ctx?.session?.messages?.push({ role: openAI.roles.USER, content: ctx.message.text});
        // @ts-ignore
        const responseAi = await openAI.chat(ctx?.session?.messages);
        // @ts-ignore
        ctx?.session?.messages?.push({ role: openAI.roles.ASSYSTANT, content: responseAi?.content});

        //if we want response audio
        const source = await textConvertor.textToSpeach(responseAi?.content);
        // ctx.sendAudio({source})

        await ctx.reply(String(responseAi?.content));
    } catch (e) {
        console.log(`Error voice message`, e)
    }
})


// handle input command
bot.command('start', async (ctx) => {
    // @ts-ignore
    ctx?.session = initSession;
    await ctx.reply(JSON.stringify(ctx.message, null, 2));
})

bot.command('new', async (ctx) => {
    // @ts-ignore
    ctx?.session = initSession;
    await ctx.reply("Waiting message...");
})

bot.launch().finally(() => console.log("Bot has been started"));
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
