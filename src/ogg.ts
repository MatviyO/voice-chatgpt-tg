import axios from "axios";
import {createWriteStream, mkdirSync} from "fs";
import {dirname} from "path";
import {fileURLToPath, resolve} from "url";
// core
import ffmpeg from "fluent-ffmpeg";
//for convert
import installer from "@ffmpeg-installer/ffmpeg"
import {removeFile} from "./utils";

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        // init path to convertor
        ffmpeg.setFfmpegPath(installer.path);
    }

    toMp3(inputFilePath: string, outputFilePath: string): Promise<string> {
        try {
            return new Promise((resolve, reject) => {
                ffmpeg()
                    .input(inputFilePath)
                    .inputOptions('-t 30') // Trim the input to 30 seconds
                    .audioCodec('libmp3lame') // Use MP3 codec
                    .toFormat('mp3') // Set the output format to MP3
                    .on('end', () => {
                        removeFile(inputFilePath);
                        resolve(`/Users/admin/Github/voice-chatgpt-tg/${outputFilePath}.mp3`); // Resolve with the output file path
                    })
                    .on('error', (err) => {
                        reject(`FFmpeg error: ${err}`);
                    })
                    .save(`/Users/admin/Github/voice-chatgpt-tg/${outputFilePath}.mp3`); // Specify the output file path
            });
        } catch (e) {
            console.log("Error toMp3", e);
        }
    }

    async create(url: string, fileName: string): Promise<string> {
        try {
            const oggPath = resolve(__dirname, `${fileName}.ogg`)
            const response = await axios({
                method: 'get',
                url,
                responseType: "stream"
            })
            return new Promise(resolve => {
                const stream = createWriteStream(oggPath);
                response.data.pipe(stream);
                stream.on("finish", () => resolve(oggPath))
            })
        } catch (e) {
            console.log("Error create ogg", e);
        }

    }
}

export const ogg = new OggConverter()
