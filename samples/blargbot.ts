import { IBlargbot, IModLog, IModLogWarnResult } from '../blargbot'; // 'bbtag/blargbot'
import { IChannel, IDiscordClient, IEmbedField, IGuild, IUser, Snowflake } from '../discord'; // 'bbtag/discord'

export class InMemoryBlargbot implements IBlargbot {
    public readonly modlog: IModLog;
    // @ts-ignore
    private readonly _discord: IDiscordClient;

    public constructor(discord: IDiscordClient) {
        this.modlog = new InMemoryModLog(discord);
        this._discord = discord;
    }

    public getCommandPrefix(_guildId: Snowflake): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getTimezone(_user: Snowflake | IUser): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public dump(_content: string, _channel: IChannel): Promise<Snowflake> {
        throw new Error('Method not implemented.');
    }
}

export class InMemoryModLog implements IModLog {
    // @ts-ignore
    private readonly _discord: IDiscordClient;

    public constructor(discord: IDiscordClient) {
        this._discord = discord;
    }

    public createEntry(
        _guild: IGuild,
        _user: IUser | IUser[],
        _mod?: IUser,
        _type?: string,
        _reason?: string,
        _color?: number,
        _fields?: IEmbedField[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public warn(_guild: IGuild, _user: IUser, _count?: number | undefined): Promise<IModLogWarnResult> {
        throw new Error('Method not implemented.');
    }

    public pardon(_guild: IGuild, _user: IUser, _count?: number | undefined): Promise<number> {
        throw new Error('Method not implemented.');
    }

    public getWarnings(_guild: IGuild, _user: IUser): Promise<number> {
        throw new Error('Method not implemented.');
    }
}