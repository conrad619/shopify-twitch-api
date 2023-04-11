import { ChatBotConfig } from './src/app/config/config.model';
import { ConfigValidator } from './src/app/config/config-validator';
import { TwitchChatBot } from './src/app/chatBot/chatbot';
require('dotenv').config()

const tokens = {
    "twitch": {
        "token_endpoint": process.env.TOKEN_ENDPOINT,
        "username": process.env.USERNAME,
        "client_id":process.env.CLIENT_ID,
        "client_secret":process.env.CLIENT_SECRET,
        "authorization_code":process.env.AUTHORIZATION_CODE,
        "channel":process.env.CHANNEL
    }
}
console.log("twitch tokens")
console.log(tokens.twitch.token_endpoint)
ConfigValidator.readConfig(tokens)
.then((config: ChatBotConfig) =>  new TwitchChatBot(config).launch());














