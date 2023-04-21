import { InvalidTwitchConfigError } from './../models/error.model';
import { validate } from "class-validator";
import { ChatBotConfig } from "./config.model"


export class ConfigValidator {

    public static async readConfig(config: any): Promise<ChatBotConfig> {
        var configJson = config
        try {
            console.info("Validating Config...")

            let completeConfig = new ChatBotConfig(
                configJson.twitch.token_endpoint,
                configJson.twitch.username,
                configJson.twitch.client_id,
                configJson.twitch.client_secret,
                configJson.twitch.authorization_code,
                configJson.twitch.channel,
                configJson.twitch.broadcaster_id,
                configJson.twitch.store
            )
            let completeConfigErrors = await validate(completeConfig);

            if (completeConfigErrors.length > 0)
                throw new InvalidTwitchConfigError(`The provided mothership config is not valid, here are the issues: ${completeConfigErrors.join()}`)

            console.info("Config is valid.")
            return completeConfig;

        } catch (err: unknown) {
            if (err instanceof InvalidTwitchConfigError)
                console.log(err.message)    
            throw err
                
        }
    }
}