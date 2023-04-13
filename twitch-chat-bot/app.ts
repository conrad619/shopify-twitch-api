import { ChatBotConfig } from './src/app/config/config.model';
import { ConfigValidator } from './src/app/config/config-validator';
import { TwitchChatBot } from './src/app/chatBot/chatbot';
import express, { Request, Response } from 'express';
import { isNotEmpty } from 'class-validator';


require('dotenv').config()

const tokens = {
    "twitch": {
        "token_endpoint": process.env.TOKEN_ENDPOINT,
        "username": process.env.USERNAME,
        "client_id":process.env.CLIENT_ID,
        "client_secret":process.env.CLIENT_SECRET,
        "authorization_code":process.env.AUTHORIZATION_CODE,
        "channel":process.env.CHANNEL,
        "broadcaster_id":'1234'
    }
}
console.log("twitch tokens")
console.log(tokens.twitch.token_endpoint)
// ConfigValidator.readConfig(tokens)
// .then((config: ChatBotConfig) =>  new TwitchChatBot(config).launch());




const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send(`<a href='https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=9egbqe7dfh8hb291qvxmhykqamhu29&redirect_uri=http://localhost:3000/token&scope=chat%3Aread%20chat%3Aedit%20moderator%3Amanage%3Aannouncements%20user%3Aread%3Abroadcast%20moderation%3Aread'>generate code</a>`);
});

//get token generated
app.get('/token', (req: Request, res: Response) => {
    const code = req.query.code as string;
    tokens.twitch.authorization_code = code
    res.send(`
        generated code: ${code}
        <form method="get" action="/bot">
            <label for="channel">Enter Channel Name for bot to Join:</label>
            <input type="text" id="channel" name="channel">
            <input type="submit" value="join"/>
        </form>
    `)
    // res.send(`code:${code} <a href='/bot?action=join'>join<a/>`);
});

// get action and channel name to join
app.get('/bot', (req: Request, res: Response) => {
    const action = req.query.action as string;
    const channel = req.query.channel as string;
    if(isNotEmpty(channel))
        tokens.twitch.channel = channel;
    ConfigValidator.readConfig(tokens)
    .then((config: ChatBotConfig) =>  new TwitchChatBot(config).launch());
    
    res.redirect('/success')
})

app.get('/success', (req: Request, res: Response) => {
    res.send(`Successfully joined the channel <a href='https://www.twitch.tv/${tokens.twitch.channel}'>https://www.twitch.tv/${tokens.twitch.channel}</a>`)
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});












