import { Duration, Moment } from 'moment-timezone';
import { IDMSingleChannel } from './channel';
import { ICollection, IEntity, Snowflake } from './generic';
import { IGuild } from './guild';
import { ActivityType, ModerationResult } from './instances';
import { IRole } from './role';

export interface ISelfUser extends IUser {

    getDmChannel(): Promise<never>;
}

export interface ISelfMember extends IGuildMember {
    readonly user: ISelfUser;
}

export interface IGuildMember {
    readonly guild: IGuild;
    readonly user: IUser;
    readonly nickname: string;
    readonly roles: ICollection<IRole>;
    readonly joinedAt: Moment;

    addRole(moderator: IUser, role: IRole | Snowflake, reason?: string): Promise<ModerationResult>;
    removeRole(moderator: IUser, role: IRole | Snowflake, reason?: string): Promise<ModerationResult>;
    ban(moderator: IUser, deleteDays?: number, reason?: string, duration?: Duration): Promise<ModerationResult>;
    unban(moderator: IUser, reason?: string): Promise<ModerationResult>;
    kick(moderator: IUser, reason?: string): Promise<ModerationResult>;
    setNickname(moderator: IUser, name: string | undefined, reason?: string): Promise<ModerationResult>;
}

export interface IUser extends IEntity {
    readonly username: string;
    readonly discriminator: string;
    readonly avatarURL: string;
    readonly isBot: boolean;
    readonly mention: string;
    readonly createdAt: Moment;
    readonly activities: UserActivity[];
    readonly status?: UserStatus;
    readonly client: IClientStatus;

    getDmChannel(): Promise<IDMSingleChannel>;
}

export type UserActivity = IUserPlaying | IUserStreaming | IUserListening;

// Reference: https://discordapp.com/developers/docs/topics/gateway#activity-object
export interface IUserActivity {
    readonly name: string;
    readonly type: ActivityType;
    readonly appId?: Snowflake;
    readonly details?: string;
    readonly state?: string;
}

export interface IUserPlaying extends IUserActivity {
    readonly type: ActivityType.Game;
    readonly steamUrl?: string;
}

export interface IUserStreaming extends IUserActivity {
    readonly type: ActivityType.Streaming;
}

export interface IUserListening extends IUserActivity {
    readonly type: ActivityType.Listening;
}

// Reference: https://discordapp.com/developers/docs/topics/gateway#client-status-object
export type UserStatus = 'online' | 'dnd' | 'idle';

export interface IClientStatus {
    readonly desktop?: UserStatus;
    readonly mobile?: UserStatus;
    readonly web?: UserStatus;
}