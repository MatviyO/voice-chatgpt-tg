import {unlink} from "fs/promises";

export async function removeFile(path: string) {
    try {
        await unlink(path);
    } catch (e) {
        console.log("Error removeFIle", e);
    }
}
