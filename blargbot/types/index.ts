import { Awaitable } from '../..';
import { Color, IChannel, IEmbedField, IGuild, IUser, Snowflake } from '../../discord';

export interface IBlargbot {
    readonly modlog: IModLog;
    getCommandPrefix(guildId: Snowflake): Awaitable<string>;
    getTimezone(user: IUser | Snowflake): Awaitable<string>;
    dump(content: string, channel: IChannel): Awaitable<Snowflake>;
}

export interface IModLog {
    createEntry(guild: IGuild, user: IUser | IUser[], mod?: IUser, type?: string, reason?: string, color?: Color, fields?: IEmbedField[]): Awaitable<void>;
    warn(guild: IGuild, user: IUser, count?: number): Awaitable<IModLogWarnResult>;
    pardon(guild: IGuild, user: IUser, count?: number): Awaitable<number>;
    getWarnings(guild: IGuild, user: IUser): Awaitable<number>;
}

export interface IModLogWarnResult {
    readonly type: WarningType;
    readonly count: number;
    readonly error?: any;
}

export enum WarningType {
    Warning = 0,
    Ban = 1,
    Kick = 2
}