import { ChatBotConfig } from './../config/config.model';
import { TwitchTokenDetails } from './../models/twitchTokenDetails.models';
import { TwitchTokenResponseValidator } from './../utils/TwitchTokenResponseValidator';
import { MalformedTwitchRequestError, NoTwitchResponseError, TwitchResponseError } from '../models/error.model';
import { isNotEmpty } from 'class-validator';
const axios = require('axios');

export class TwitchChatBot {

    tmi = require('tmi.js');

    public twitchClient: any;
    private tokenDetails!: TwitchTokenDetails;
    public list_of_users_who_enter:any[] = []
    public setTimerWinner:any
    public timeActive:boolean = false
    public winner:any
    public sendingGift:boolean = true
    public timerCountToWinner:number = 5000

    constructor(private config: ChatBotConfig) { }

    async launch() {
        this.tokenDetails = await this.fetchAccessToken();
        
        this.config.broadcaster_id = await this.GetBroadcasterID();
        
        this.twitchClient = new this.tmi.Client(
            this.buildConnectionConfig(
                this.config.twitchChannel,
                this.config.twitchUser,
                this.tokenDetails.access_token)
        );
        this.setupBotBehavior();
        this.twitchClient.connect();
        


        // this.getModerators()

        //setbroadcaster_id for announcement

    }

    private async fetchAccessToken(): Promise<TwitchTokenDetails> {
        console.log("Fetching Twitch OAuth Token");
        return axios({
            method: 'post',
            url: this.config.twitchTokenEndpoint,
            params: {
                client_id: this.config.twitchClientId,
                client_secret: this.config.twitchClientSecret,
                code: this.config.twitchAuthorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost'

            },
            responseType: 'json'
        }).then(async function (response: any) {
            // handle success

            return await TwitchTokenResponseValidator.parseResponse(response.data);
        }).catch(function (error: any) {
            console.log("Failed to get Twitch OAuth Token");
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                throw new TwitchResponseError(error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                throw new NoTwitchResponseError(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new MalformedTwitchRequestError(error.request);
            }
        })
    }

    private setupBotBehavior() {
        this.twitchClient.on('message', (channel: any, tags: any, message: any, self: any) => {
            let helloCommand = "!hello"
            let enterCommand = "!enter"

            //! means a command is coming by, and we check if it matches the command we currently support
            if (message.startsWith('!') && message === helloCommand)
                this.sayHelloToUser(channel,tags);
            if (message.startsWith('!') && message === enterCommand && this.sendingGift){
                this.list_of_users_who_enter.push(tags)
                if(!this.timeActive){

                    this.timeActive = true
                    this.setTimerWinner = setTimeout(()=>{
                        const random = Math.floor(Math.random()*this.list_of_users_who_enter.length)
                        this.winner = this.list_of_users_who_enter[random]
                        this.SendAnnouncementWinner(this.winner)
                        this.timeActive=false
                        this.sendingGift=false
                    },this.timerCountToWinner)


                }
            }
        });
    }

    private sayHelloToUser(channel: any, tags: any) {
            // console.log(tags)
            this.twitchClient.say(channel, `Hello, ${ tags.username }! Welcome to the channel.`);
    }

    // private async getModerators(){
    //     axios({
    //         method:'get',
    //         url:'https://api.twitch.tv/helix/moderation/moderators',
    //         params: {
    //             broadcaster_id: '92422518',
    //         },
    //         headers: {
    //             'Authorization': 'Bearer '+this.tokenDetails.access_token,
    //             'Client-Id':this.config.twitchClientId,

    //         }
    //     }).then(async function (response: any) {
    //         // handle success
    //         await console.log(response.data)
    //     }).catch(function (error: any) {
    //         console.log("Failed to to moderate");
    //         if (error.response) {
    //             // The request was made and the server responded with a status code
    //             // that falls out of the range of 2xx
    //             console.log(error.response.data)
    //             throw new TwitchResponseError(error.response.data);
    //         }
    //     })

        
    //     // this.tokenDetails = await this.refreshToken()
    // }

    public async SendAnnouncementWinner(tags:any){
        
        
        axios({
            method: 'post',
            url: 'https://api.twitch.tv/helix/chat/announcements',
            params: {
                broadcaster_id: '92422518',
                moderator_id: '92422518',
            },
            headers: {
                'Authorization': 'Bearer '+this.tokenDetails.access_token,
                'Client-Id':this.config.twitchClientId,
                'Content-Type': 'application/json'
            },
            data:{
                message:`GIVEAWAY WINNER ANNOUNCEMENT, ${tags.username}! won a gift merch.`,
                color:"green"
            },
            responseType: 'json'
        }).then(async function (response: any) {
            // handle success
            await response.data
            
        }).catch(async function (error: any) {
            console.log("Failed to announce");
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                throw new TwitchResponseError(error.response.data);
            }
        })
    }

    public async SendAnnouncementGiveAway(message:string){
        
        
        axios({
            method: 'post',
            url: 'https://api.twitch.tv/helix/chat/announcements',
            params: {
                broadcaster_id: '92422518',
                moderator_id: '92422518',
            },
            headers: {
                'Authorization': 'Bearer '+this.tokenDetails.access_token,
                'Client-Id':this.config.twitchClientId,
                'Content-Type': 'application/json'
            },
            data:{
                message:message,
                color:"green"
            },
            responseType: 'json'
        }).then(async function (response: any) {
            // handle success
            await response.data
        }).catch(async function (error: any) {
            console.log("Failed to announce");
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                throw new TwitchResponseError(error.response.data);
            }
        })

        this.sendingGift=true
    }

    private async GetBroadcasterID(){
        
        
        axios({
            method: 'get',
            url: `https://api.twitch.tv/helix/users`,
            params: {
                login: this.config.twitchChannel
            },
            headers: {
                'Authorization': 'Bearer '+this.tokenDetails.access_token,
                'Client-Id':this.config.twitchClientId,
                'Content-Type': 'application/json'
            }
        }).then(async function (response: any) {
            // handle success
            return await response.data[0].id as string;
        }).catch(async function (error: any) {
            console.log("Failed to broadcaster");
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data)
                throw new TwitchResponseError(error.response.data);
            }
        })

        return "failed"
    }

    
    
    private async SayWinnerToUser(channel: any, tags: any) {
        console.log(tags)
        this.list_of_users_who_enter.push(tags)
        // this.twitchClient.say(channel, `/announce GIVEAWAY WINNER ANNOUNCEMENT, ${ tags.username }! won a gift merch. https://geeksunleashed-new.myshopify.com/redeem to redeem.`);
        // this.GetBroadcasterID()

    }

    private buildConnectionConfig(channel: string, username: string, accessToken: string) {
        return {
            options: { debug: true },
            connection: {
                secure: true,
                reconnect: true
            },
            identity: {
                username: `${username}`,
                password: `oauth:${accessToken}`
            },
            channels: [`${channel}`]
        };
    }

    public getConfig():ChatBotConfig{
        return this.config
    }
}


