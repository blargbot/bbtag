import { Moment } from 'moment-timezone';
export interface IClient {
    getGuild(id: Snowflake): Promise<IGuild>;
    getChannel(id: Snowflake): Promise<IChannel>;
    getUser(id: Snowflake): Promise<IUser>;
}
export declare type Snowflake = string;
export interface IGuild extends IEntity {
    readonly name: Awaitable<string>;
    readonly avatarUrl: Awaitable<string>;
    getChannels(): Awaitable<IChannel[]>;
    getMembers(): Awaitable<IMember[]>;
    getMember(id: Snowflake): Awaitable<IMember>;
    getRoles(): Awaitable<IRole[]>;
    addRole(name: string, color: number, permissions: number): Promise<IRole>;
    removeRole(id: Snowflake): Promise<void>;
    kick(userId: Snowflake, reason?: string): Promise<void>;
    ban(userId: Snowflake, reason?: string, daysToDelete?: number): Promise<void>;
}
export interface IGuildChannel extends IChannel {
    readonly guild: IGuild;
    readonly position: Awaitable<number>;
}
export interface IChannel extends IEntity {
    readonly name: Awaitable<string>;
    readonly kind: ChannelType;
    send(options: IMsgOptions): Promise<IMessage>;
    delete(...messages: Snowflake[]): Promise<void>;
}
export interface IMember extends IUser {
    readonly guild: Awaitable<IGuild>;
    readonly nickname: Awaitable<string>;
    readonly joinedAt: Awaitable<Moment>;
    readonly roles: Awaitable<Snowflake[]>;
    setNickname(nickname: string): Promise<void>;
    addRole(roleId: Snowflake): Promise<void>;
    removeRole(roleId: Snowflake): Promise<void>;
}
export interface IRole extends IEntity {
    readonly name: Awaitable<string>;
    readonly color: Awaitable<number>;
    readonly permissions: Awaitable<number>;
    setName(name: string): Promise<void>;
    setColor(color: number): Promise<void>;
    setPermissions(permissions: number): Promise<void>;
    delete(): Promise<void>;
}
export interface IUser extends IEntity {
    readonly username: Awaitable<string>;
    readonly discriminator: Awaitable<string>;
    readonly avatarUrl: Awaitable<string>;
    readonly isBot: Awaitable<boolean>;
    readonly createdAt: Awaitable<Moment>;
    readonly status: Awaitable<number>;
}
export interface IMessage extends IEntity {
    readonly author: IUser;
    readonly channel: IChannel;
    readonly content: string;
    readonly embeds: IEmbed[];
    readonly attachments: string[];
    readonly timestamp: number;
    readonly edited: Awaitable<number | undefined>;
    delete(): Promise<void>;
    edit(text: string | undefined, embed: IEmbed): Promise<void>;
}
export interface IEmbed {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    timestamp?: number;
    footer?: {
        text?: string;
        icon_url?: string;
    };
    thumbnail?: {
        url?: string;
    };
    image?: {
        url?: string;
    };
    author?: {
        name?: string;
        url?: string;
        icon_url?: string;
    };
    fields?: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
}
export interface IEntity {
    readonly id: Snowflake;
}
export interface IMsgOptions {
    content?: string;
    embed?: IEmbed;
    nsfw?: string;
    disableEveryone?: boolean;
}
export declare type Awaitable<T> = Promise<T> | T;
export declare type ChannelType = 'text' | 'voice';
