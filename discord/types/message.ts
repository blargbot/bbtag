import { Moment } from 'moment-timezone';
import * as Channels from './channel';
import { IEmbed } from './embed';
import { IReaction } from './emoji';
import { IEntity } from './generic';
import { AddReactionResult, MessageType, ModerationResult, RemoveReactionResult } from './instances';
import { Snowflake } from './primitives';
import { IRole } from './role';
import { IGuildMember, IUser } from './user';

// Typing

export type Message = GuildMessage | DMMessage;
export type GuildMessage = IGuildTextChannelMessage | IGuildNewsChannelMessage;
export type DMMessage = IDMSingleChannelMessage | IDMGroupChannelMessage;

export interface IAttachment {
    readonly name: string;
    readonly url: string;
}

// Generics

export interface IMessage extends IEntity {
    readonly type: MessageType;
    readonly channel: Channels.MessageChannel;
}

export interface IDefaultMessage extends IMessage {
    readonly type: MessageType.Default;
    readonly content: string;
    readonly embeds: readonly IEmbed[];
    readonly attachments: readonly IAttachment[];
    readonly author: IUser;
    readonly timestamp: Moment;
    readonly editedTimestamp?: Moment;
    readonly mentions: readonly IUser[];
    readonly roleMentions: readonly IRole[];
    readonly reactions?: readonly IReaction[];
    readonly pinned: boolean;

    delete(moderator: IUser): Promise<ModerationResult>;
    addReaction(reaction: string): Promise<AddReactionResult>;
    removeReaction(reaction: string): Promise<RemoveReactionResult>;
    removeReaction(moderator: IUser, reaction: string, user: Snowflake): Promise<ModerationResult>;
    removeReactions(moderator: IUser): Promise<ModerationResult>;
    getReaction(reaction: string): Promise<IUser[]>;
}

// Concretes

export interface IGuildTextChannelMessage extends IDefaultMessage {
    readonly channel: Channels.IGuildTextChannel;
    readonly member: IGuildMember;
}

export interface IDMSingleChannelMessage extends IDefaultMessage {
    readonly channel: Channels.IDMSingleChannel;
}

export interface IDMGroupChannelMessage extends IDefaultMessage {
    readonly channel: Channels.IDMGroupChannel;
}

export interface IGuildNewsChannelMessage extends IDefaultMessage {
    readonly channel: Channels.IGuildNewsChannel;
    readonly member: IGuildMember;
}