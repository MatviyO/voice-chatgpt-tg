import axios from "axios";
import {createWriteStream} from "fs";
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

    toMp3(url: string, fileName: string): Promise<string> {
        try {
            const outputPath = resolve(dirname(url), `${fileName}.mp3`);
            return new Promise((resolve, reject) =>  {
                ffmpeg(url).inputOptions("-t 30").output(outputPath)
                    .on("end", () => {
                        removeFile(url);
                        resolve(outputPath)
                    })
                    .on("error", (e) => reject(e.message))
                    .run();
            })
        } catch (e) {
            console.log("Error toMp3", e);
        }
    }

    async create(url: string, fileName: string): Promise<string> {
        try {
            const oggPath = resolve(__dirname, `../voices/${fileName}.ogg`)
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
