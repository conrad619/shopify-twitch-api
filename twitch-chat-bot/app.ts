import { ChatBotConfig } from './src/app/config/config.model';
import { ConfigValidator } from './src/app/config/config-validator';
import { TwitchChatBot } from './src/app/chatBot/chatbot';
import express, { Request, Response } from 'express';
import { isNotEmpty } from 'class-validator';

const path = require('path');

require('dotenv').config()


const tokens = {
    "twitch": {
        "token_endpoint": process.env.TOKEN_ENDPOINT,
        "username": process.env.USERNAME,
        "client_id":process.env.CLIENT_ID,
        "client_secret":process.env.CLIENT_SECRET,
        "authorization_code":process.env.AUTHORIZATION_CODE,
        "channel":process.env.CHANNEL,
        "broadcaster_id":'1234',
        "store":'https://gamers-pixel.myshopify.com/'
    }
}


console.log("twitch tokens")
console.log(tokens.twitch.token_endpoint)


const app = express();
const port = 3000;
let chatbot:TwitchChatBot
let chatbots:TwitchChatBot[] = []
let queue:any[] = []


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }))


// parse application/json
app.use(express.json())

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


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
            <label for="username">Enter Username:</label>
            <input type="text" id="username" name="username" value="witsz">
            <label for="channel">Enter Channel Name:</label>
            <input type="text" id="channel" name="channel" value="witsz">
            <input type="text" id="store" name="store" value="witsz">
            <input type="submit" value="join"/>
        </form>`);
});


app.get('/api/setup', (req: Request, res: Response) => {
    const channel = req.query.channel as string;
    const username = req.query.username as string;
    const store = req.query.store as string;
    if(isNotEmpty(channel) && isNotEmpty(username)){
        tokens.twitch.channel = channel;
        tokens.twitch.username = username;
        tokens.twitch.store = store
        if(!queue.includes(channel)){
            console.log('not in array')
            queue.push(channel)
            queue[channel] = tokens
        }else{
            console.log('in array')
            queue[channel] = tokens
        }
        res.redirect(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${tokens.twitch.client_id}&redirect_uri=http://localhost:3000/join&scope=chat%3Aread%20chat%3Aedit%20moderator%3Amanage%3Aannouncements%20user%3Aread%3Abroadcast%20moderation%3Aread&state=${tokens.twitch.channel}`)
    }else{
        res.redirect('/?invalid=true')
    }
})


// get action and channel name to join
app.get('/api/join', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    tokens.twitch.authorization_code = code

    console.log("this is the code: "+code)
    console.log("check state: "+queue[state])
    
    ConfigValidator.readConfig(queue[state])
    .then( async(config: ChatBotConfig) =>  {
        chatbot = new TwitchChatBot(config)
        chatbots.push(chatbot)
        await chatbot.launch()
        res.send("success")
        // res.redirect(`${chatbot.getConfig().store}/authcode?code=${chatbot.getConfig().twitchAuthorizationCode}`)
    });
    
})


// app.get('/success', (req: Request, res: Response) => {
//     res.send(`Successfully joined the channel <a href='https://www.twitch.tv/${tokens.twitch.channel}'>https://www.twitch.tv/${tokens.twitch.channel}</a>`)
// })


app.post('/api/giveaway-announcement', async(req: Request, res:Response) => {
    const message = req.body.message as string
    const channel = req.body.channel as string
    const code = req.body.code as string
    chatbots.forEach(async c=>{ 

        //search for bot that has channel
        if(channel == c.getConfig().twitchChannel && code == c.getConfig().twitchAuthorizationCode)
        {
            await c.SendAnnouncementGiveAway(message)
        }

    })

    res.status(200).send('success')
})


app.post('/api/winner-announcement', (req: Request, res:Response) => {
    const message = req.body.message as string
    const channel = req.body.channel as string
    const code = req.body.code as string
    chatbots.forEach(c=>{ 

        //search for bot that has channel
        if(channel == c.getConfig().twitchChannel && code == c.getConfig().twitchAuthorizationCode)
        {
            c.SendAnnouncementWinner(message)
        }

    })

    res.send('success message')
})



// app.get('/form', (req: Request, res: Response) => {
//     const code = req.query.code //code for shopify authentication
//     const store = req.query.store

//     res.render(path.join('form.html'),{store:store,code:code});
// })

app.get('/api/verify',async (req:Request, res:Response) => {
    const code = req.query.code as string;
    const axios = require('axios');

    let access_token:string=""
    
    await axios({
        method: 'post',
        url: "https://id.twitch.tv/oauth2/token",
        params: {
            client_id: tokens.twitch.client_id,
            client_secret: tokens.twitch.client_secret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000'

        }
    }).then(async function (response: any) {
        // handle success
        console.log("got token")
        await console.log(response.data)
        access_token = response.data.access_token
    }).catch(function (error: any) {
        console.log("failed token")
        console.log(error.response.data)
    })

    // await axios({
    //     method:'get',
    //     url:'https://id.twitch.tv/oauth2/validate',
    //     headers: {
    //         'Authorization': `OAuth ${access_token}`,
    //     }
    // }).then(async function (response: any) {
    //     // handle success
    //     console.log("were success")
    //     await console.log(response.data)
    // }).catch(function (error: any) {
    //     console.log("Failed to validatec");
    //     if (error.response) {
    //         // The request was made and the server responded with a status code
    //         // that falls out of the range of 2xx
    //         console.log(error.response.data)
    //     }
    // })


    
})


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});




//to do
/*
announce gift available

*/











