import { readFileSync, writeFileSync } from "fs";
import {dirname, resolve} from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import axios from "axios";

const __dirname = dirname(fileURLToPath(import.meta.url));


// google api convertor to speach
class TextConvertor {

    generateToken(key: any) {
        try {
            const token = jwt.sign(
                {
                    iss: key.client_email,
                    scope: 'https://www.googleapis.com/auth/cloud-platform',
                    aud: 'https://www.googleapis.com/oauth2/v4/token',
                    exp: Math.floor(Date.now() / 1000) + 60 * 60,
                    iat: Math.floor(Date.now() / 1000),
                },
                key.private_key,
                { algorithm: 'RS256' }
            )
            return token;
        } catch (e) {
            console.log("Error generateToken", e.message);
        }
    }

    async getAccessToken(token: string): Promise<string> {
        const response = await axios.post(
            'https://www.googleapis.com/oauth2/v4/token',
            {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token,
            }
        )
        return response.data.access_token;
    }

    getGoogleToken() {
        const key = JSON.parse(readFileSync(resolve(__dirname, '../google-api-key.json'), 'utf8'));
        const token = this.generateToken(key);
        const accessToken = this.getAccessToken(token);
        return accessToken;
    }

    async textToSpeach(text: string) {
        try {
            const url = "https://texttospeech.googleapis.com/v1/text:synthesize";
            const params = {
                input: { text },
                voice: {
                    languageCode: 'en-US',
                    ssmlGender: 'NEUTRAL',
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                },
            }
            // return base64 that we can convert to mpt3
            const response = await axios({
                url,
                method: "post",
                data: params,
                headers: {
                    Authorization: `Bearer ${this.getGoogleToken()}`,
                    'Content-Type': 'application/json',
                },
            })
            return Buffer.from(response.data.audioContent, 'base64');
            // const file = writeFileSync(resolve(__dirname, '../audio.mp3'), buffer);
        } catch (e) {
            console.log("Error textToSpeach", e.message);
        }
    }
}

export const textConvertor = new TextConvertor();
