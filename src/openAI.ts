import OpenAI from 'openai';
import config from "config";
import { createReadStream } from "fs";

class OpenAIModule {
    openai;
    roles = {
        ASSYSTANT: "assistant",
        USER: "user",
        SYSTEM: "system",
    }
    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey,
        });
    }

    async chat(messages: Array<any>) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages,
                max_tokens: 1000,
                temperature: 0.4,
                top_p: 0.4,
            });
            return response?.choices[0]?.message;
        } catch (e) {
            console.log("Error chat gpt", e.message);
        }

    }

    async transcription(filepath: string): Promise<string> {
        try {
            const response = await this.openai.audio.transcriptions.create({
                model: 'whisper-1',
                file: createReadStream(filepath),
            });
            console.log('Transcription:', response);
            const transcription: string = response?.text;
            return transcription;
        } catch (e) {
            console.log(`Error transcription`, e.message);
        }
    }

}

export const openAI = new OpenAIModule(config.get("AI_API_KEY"));
