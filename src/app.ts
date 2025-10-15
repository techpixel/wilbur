import { App } from "@slack/bolt";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: Boolean(process.env.SOCKET_MODE === "true"),
}); 