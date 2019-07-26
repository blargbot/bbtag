import { Awaitable, Engine, ISubtagContextArgs, SubtagContext } from '..';
import { DMMessage, GuildMessage, IDefaultMessage, ISelfUser, IUser, Snowflake } from './types';

export interface IDiscordContextArgs<T extends IDefaultMessage> extends ISubtagContextArgs {
    readonly message: T;
    readonly self: ISelfUser;
    isUserStaff(this: DiscordContext<T>, user: IUser | Snowflake): Awaitable<boolean>;
}

export type DiscordGuildContext = DiscordContext<GuildMessage>;
export type DiscordDMContext = DiscordContext<DMMessage>;

export class DiscordContext<T extends IDefaultMessage = IDefaultMessage> extends SubtagContext {
    public readonly self: ISelfUser;
    public readonly message: T;

    // @ts-ignore
    private readonly ['__DiscordContextDiscriminator__']: undefined;

    public constructor(engine: Engine<DiscordContext<T>>, args: IDiscordContextArgs<T>) {
        super(engine, args);
        this.self = args.self;
        this.message = args.message;
        this.isUserStaff = args.isUserStaff;
    }

    public isUserStaff(user: IUser): Awaitable<boolean> { throw user; }
}