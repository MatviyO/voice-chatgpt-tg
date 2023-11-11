import { Context } from "telegraf";
import { ETypeResponse } from "./ETypeResponse";

interface ITelegrafSession {
    messages: any[];
    responseMode: ETypeResponse;
}

interface ITelegrafContext extends Context {
    session: ITelegrafSession;
}

export type {
    ITelegrafContext, ITelegrafSession
}
