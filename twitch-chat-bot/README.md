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
    &redirect_uri=http://localhost:3000
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



process
* vendor enters channel name then submits to call api to authenticate user - then bot joins the channel
* shopify display gift button on products
* when gift button clicked - add to cart - fulfill - then call api to announce free give away and instructions to win gift
* in twitch - bot detects who types !enter within time frame - twitch server selects random winner
* twitch bot announces winner
* twitch server calls shopify api and sends the winner's username and channel where winner comes from
* shopify server receives the winner's username and starts process for the page and calls twitch api to send the link of the page to claim the gift to the winner(via twitch whisper)
* winner starts filling form then submits then process...???? announce pa ba na naclaim yung gift?



// winner login

winner login
sign in button - contains link for authorization
https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=9egbqe7dfh8hb291qvxmhykqamhu29&redirect_uri=http://localhost:3000/token&scope=chat%3Aread
user authorizes
authorize redirects to token link for access token
token returns access token and sends code to shopify validate api
get validate of the user login

*** API
`/api/setup` - api for retreiving the auth code, which is use to join the channel, it has no return but instead redirects the admin to twitch login(another tab) to authorize bot to join the channel then redirects back to store once done authorizing
required
`channel` - the channel the bot joins to
`username` - its for token settings
`store` - for referer

`/api/gift-announcement` - to announce giveaway in stream, this activates the bot to detect users who enters `!enter` and capture thems then random chooses winner after 60 sec
`message` - message to twitch stream to announce winner
`channel` - the channel to send the message to
`code` - for security/authorization

`/api/winner-announcement` - to announce winner in the twitch stream
required
`message` - message to twitch stream to announce winner
`channel` - the channel to send the message to
`code` - for security/authorization