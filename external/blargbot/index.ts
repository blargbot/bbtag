import { Color, IChannel, IEmbedField, IGuild, IUser, Snowflake } from '../discord';

export interface IBlargBot {
    readonly modlog: IModLog;
    getCommandPrefix(guildId: Snowflake): Promise<string>;
    getTimezone(user: IUser | Snowflake): Promise<string>;
    dump(content: string, channel: IChannel): Promise<Snowflake>;
}

export interface IModLog {
    createEntry(guild: IGuild, user: IUser | IUser[], mod?: IUser, type?: string, reason?: string, color?: Color, fields?: IEmbedField[]): Promise<void>;
    warn(guild: IGuild, user: IUser, count?: number): Promise<IModLogWarnResult>;
    pardon(guild: IGuild, user: IUser, count?: number): Promise<number>;
    getWarnings(guild: IGuild, user: IUser): Promise<number>;
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