import { IEntity, Snowflake, Color, Permissions, ICollection } from './generic';
import { GuildChannel } from './channel';
import { IGuildMember, IUser } from './user';
import { Duration, Moment } from 'moment';
import { TryResult } from '../../util';
import { ModerationResult, ModerationError } from './instances';
import { IRole, IRoleCreateOptions } from './role';

type _ = undefined;

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
    createRole(moderator: IUser, options: IRoleCreateOptions, reason?: string): Promise<TryResult<Snowflake, ModerationError>>;
    deleteRole(moderator: IUser, options: IRoleCreateOptions, reason?: string): Promise<ModerationResult>;
}