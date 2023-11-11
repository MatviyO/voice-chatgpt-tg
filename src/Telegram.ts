import { ITelegrafSession } from "./core/types/ISession";

class Telegram {
    addMessageToSession(session: ITelegrafSession, role: string, content: string): void {
        const message = { role, content };
        session.messages.push(message);
    }
}

export const telegram = new Telegram();
