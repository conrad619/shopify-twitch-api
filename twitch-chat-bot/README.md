# Twitch-Chat-Bot

A Chat Bot application for Twitch Channel Chats. 

Referenced in this [Medium Article](https://medium.com/codex/creating-a-twitch-chat-bot-ca368321b7f7).

## Pre-requisites

To run this application node.js and npm are required to be installed.

## Setup

On **config.json** configure general application settings: 
- twitch settings

This application uses Twitch's [Oauth Authorization Code Flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow).
The application will do the process of fetching the OAuth token for you, but you still need to provide several values like: client_id, client_secret and authorization_code.


```
{
    "twitch": {
        "token_endpoint": "https://id.twitch.tv/oauth2/token",
        "username": "<chatBotUsername>",
        "client_id":"<clientID>",
        "client_secret":"<clientSecret>",
        "authorization_code":"<AuthCode>",
        "channel": "<channel_to_connect_to>"
    }
}
```

## Run the application

To run the application, use the command ```npm start``` from the root of the project.


https://id.twitch.tv/oauth2/authorize
    ?response_type=code
    &client_id=9egbqe7dfh8hb291qvxmhykqamhu29
    &redirect_uri=http://localhost
    &scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls

https://id.twitch.tv/oauth2/authorize
    ?response_type=code
    &client_id=9egbqe7dfh8hb291qvxmhykqamhu29
    &redirect_uri=http://localhost
    &scope=chat%3Aread%20chat%3Aedit%20moderator%3Amanage%3Aannouncements%20user%3Aread%3Abroadcast%20moderation%3Aread
    

to do
bot client id
bot secret api
get authorization code
send announcement/
!enter/
read random enter
counter
anounce winner
whisper redeem link