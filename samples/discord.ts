import { ChannelTypeMap, ChannelTypeMessageMap, ISelfUser, MessageType, Snowflake } from '../discord';

export interface IDiscordClient {
    createMessage<T extends keyof ChannelTypeMessageMap>(content: string, channelType: T, channelName: string): ChannelTypeMessageMap[T];
    createChannel<T extends keyof ChannelTypeMap>(type: T, name: string): ChannelTypeMap[T];
    getSelf(): ISelfUser;
}

export class InMemoryDiscord implements IDiscordClient {
    public createMessage<T extends keyof ChannelTypeMessageMap>(content: string, channelType: T, channelName: string): ChannelTypeMessageMap[T] {
        const result: Partial<ChannelTypeMessageMap[keyof ChannelTypeMessageMap]> = {
            id: Snowflake.from('1234'),
            type: MessageType.Default,
            channel: this.createChannel(channelType, channelName) as any,
            content
        };
        return result as ChannelTypeMessageMap[T];
    }

    public createChannel<T extends keyof ChannelTypeMap>(type: T, name: string): ChannelTypeMap[T] {
        const result: Partial<ChannelTypeMap[keyof ChannelTypeMap]> = {
            type: type as any,
            name
        };
        return result as ChannelTypeMap[T];
    }

    public getSelf(): ISelfUser {
        const result: Partial<ISelfUser> = {

        };
        return result as ISelfUser;
    }
}