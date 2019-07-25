import { IEmbed } from './embed';
import { IEntity } from './generic';
import { IGuild } from './guild';
import { ChannelType, ModerationResult } from './instances';
import { Snowflake } from './primitives';
import { IUser } from './user';

// Typing

export type Channel = GuildChannel | DMChannel;
export type GuildChannel = IGuildTextChannel | IGuildVoiceChannel | IGuildCategoryChannel | IGuildNewsChannel | IGuildStoreChannel;
export type DMChannel = IDMSingleChannel | IDMGroupChannel;
export type MessageChannel = IGuildTextChannel | IDMSingleChannel | IDMGroupChannel | IGuildNewsChannel;
export type VoiceChannel = IGuildVoiceChannel | IDMSingleChannel | IDMGroupChannel;

export interface IAttachmentData {
    readonly name: string;
    readonly file: string | Buffer;
}

// Generics

export interface IChannel extends IEntity {
    readonly name: string;
    readonly type: ChannelType;
    readonly mention: string;
}

export interface IGuildChannel extends IChannel {
    readonly type: GuildChannel['type'];
    readonly guildId: this['guild']['id'];
    readonly guild: IGuild;
    readonly position: number;
    readonly parent?: IGuildCategoryChannel;
    readonly nsfw: boolean;
}

export interface IDMChannel extends IChannel {
    readonly type: DMChannel['type'];
    readonly recipients: IUser[];
}

export interface IMessageChannel extends IChannel {
    readonly type: MessageChannel['type'];

    send(content?: string, embed?: IEmbed, files?: IAttachmentData[]): Promise<Snowflake>;
    slowmode(moderator: IUser, rateLimit: number | false, reason?: string): Promise<ModerationResult>;
}

export interface IVoiceChannel extends IChannel {
    readonly type: VoiceChannel['type'];
}

// Concretes

export interface IGuildTextChannel extends IGuildChannel, IMessageChannel {
    readonly type: ChannelType.GuildText;
}

export interface IDMSingleChannel extends IDMChannel, IMessageChannel, IVoiceChannel {
    readonly type: ChannelType.DMSingle;
    readonly recipients: [IUser];
}

export interface IGuildVoiceChannel extends IGuildChannel, IVoiceChannel {
    readonly type: ChannelType.GuildVoice;
}

export interface IDMGroupChannel extends IDMChannel, IMessageChannel, IVoiceChannel {
    readonly type: ChannelType.DMGroup;
    readonly icon?: string;
}

export interface IGuildCategoryChannel extends IGuildChannel {
    readonly type: ChannelType.GuildCategory;
    readonly parent: undefined;
}

export interface IGuildNewsChannel extends IGuildChannel, IMessageChannel {
    readonly type: ChannelType.GuildNews;
}

export interface IGuildStoreChannel extends IGuildChannel {
    readonly type: ChannelType.GuildStore;
}