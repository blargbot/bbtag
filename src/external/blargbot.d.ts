import { Snowflake, IGuild, Color, IUser, IEmbedField } from './discord';
import { WarningType } from './blargbot.instances';

export interface IBlargBot {
    getCommandPrefix(guildId: Snowflake): Promise<string>;
    getTimezone(user: IUser | Snowflake): Promise<string>;
    modlog: IModLog;
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