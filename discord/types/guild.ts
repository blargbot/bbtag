import { Duration, Moment } from 'moment-timezone';
import { Try } from '../..';
import { GuildChannel } from './channel';
import { ICollection, IEntity } from './generic';
import { ModerationError, ModerationResult } from './instances';
import { Snowflake } from './primitives';
import { IRole, IRoleCreateOptions } from './role';
import { IGuildMember, IUser } from './user';

export interface IGuild extends IEntity {
    readonly name: string;
    readonly iconURL: string;
    readonly channels: ICollection<GuildChannel>;
    readonly members: ICollection<IGuildMember>;
    readonly roles: ICollection<IRole>;
    readonly owner: IGuildMember;
    readonly createdAt: Moment;

    ban(moderator: IUser, user: IUser | Snowflake, deleteDays?: number, reason?: string, duration?: Duration): Promise<ModerationResult>;
    unban(moderator: IUser, user: IUser | Snowflake, reason?: string): Promise<ModerationResult>;
    kick(moderator: IUser, user: IUser | Snowflake, reason?: string): Promise<ModerationResult>;
    getBans(): Promise<IUser[]>;
    getChannel(id: Snowflake): Promise<GuildChannel>;
    createRole(moderator: IUser, options: IRoleCreateOptions, reason?: string): Promise<Try.Result<Snowflake, ModerationError>>;
    deleteRole(moderator: IUser, options: IRoleCreateOptions, reason?: string): Promise<ModerationResult>;
}