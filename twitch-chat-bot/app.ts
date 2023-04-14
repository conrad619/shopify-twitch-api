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
let chatbot:TwitchChatBot

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))

// parse application/json
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    
    const invalid = req.query.invalid as string;
    const warning = "Username or Channel Invalid"
    let display = "none"
    if(isNotEmpty(invalid)){
        display="block";
    }
    res.send(`
    <div style='display:${display}'>${warning}</div>
    <form method="get" action="/setup">
            <label for="username">Enter Uesrname:</label>
            <input type="text" id="username" name="username" value="witsz">
            <label for="channel">Enter Channel Name:</label>
            <input type="text" id="channel" name="channel" value="witsz">
            <input type="submit" value="join"/>
        </form>`);
});

app.get('/setup', (req: Request, res: Response) => {
    
    const channel = req.query.channel as string;
    const username = req.query.username as string;
    if(isNotEmpty(channel) && isNotEmpty(username)){
        tokens.twitch.channel = channel;
        tokens.twitch.username = username;
        res.redirect(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${tokens.twitch.client_id}&redirect_uri=http://localhost:3000/join&scope=chat%3Aread%20chat%3Aedit%20moderator%3Amanage%3Aannouncements%20user%3Aread%3Abroadcast%20moderation%3Aread`)
    }else{
        res.redirect('/?invalid=true')
    }
    
    
})
//get token generated
// app.get('/token', (req: Request, res: Response) => {
//     const code = req.query.code as string;
//     tokens.twitch.authorization_code = code
//     res.send(`
//         generated code: ${code}    
//         <a href="/join">join</a>
//     `)
//     // setTimeout(() => {
        
//     //     res.redirect('/join')
//     // },5000)
//     // res.send(`code:${code} <a href='/bot?action=join'>join<a/>`);
// });

// get action and channel name to join
app.get('/join', (req: Request, res: Response) => {
    const code = req.query.code as string;
    tokens.twitch.authorization_code = code
    ConfigValidator.readConfig(tokens)
    .then( async(config: ChatBotConfig) =>  {
        chatbot = new TwitchChatBot(config)
        await chatbot.launch()
        res.redirect('/success')
    });
    
})

app.get('/success', (req: Request, res: Response) => {
    res.send(`Successfully joined the channel <a href='https://www.twitch.tv/${tokens.twitch.channel}'>https://www.twitch.tv/${tokens.twitch.channel}</a>`)
})

app.post('/announcement', (req: Request, res:Response) => {
    const message = req.body.message as string
    chatbot.SendAnnouncement(message)
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});












