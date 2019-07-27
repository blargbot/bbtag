import { Awaitable, Engine, ISubtagContextArgs, SubtagContext } from '../lib';
import { discord, DMMessage, GuildMessage, IDiscordClient, IUser, Message, Snowflake } from './types';

export interface IDiscordContextArgs<T extends Message> extends ISubtagContextArgs {
    readonly client: IDiscordClient;
    readonly message: T;
}

export type DiscordGuildContext = DiscordContext<GuildMessage>;
export type DiscordDMContext = DiscordContext<DMMessage>;

export class DiscordContext<T extends Message = Message> extends SubtagContext {
    public readonly config!: IDiscordContextArgs<T>;
    public readonly client: IDiscordClient;
    public readonly message: T;

    // @ts-ignore
    private readonly ['__DiscordContextDiscriminator__']: never;

    public constructor(engine: Engine<DiscordContext<T>>, args: IDiscordContextArgs<T>) {
        super(engine, args);
        this.client = args.client;
        this.message = args.message;
    }

    public isUserStaff(user: IUser | Snowflake): Awaitable<boolean>;
    public async isUserStaff(user: IUser | Snowflake): Promise<boolean> {
        user = Snowflake.from(user);
        if (user === this.client.self.id) { return true; }
        if (discord.isDMMessage(this.message)) {
            return this.message.channel.recipients.has(user);
        } else if (discord.isGuildMessage(this.message)) {
            return this.message.channel.guild.owner.user.id === user;
        }
        return false;
    }
}