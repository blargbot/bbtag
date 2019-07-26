import { Awaitable, Engine } from '..';
import { ISystemContextArgs, SystemContext } from '../system';
import { DMMessage, GuildMessage, IDefaultMessage, ISelfUser, IUser, Snowflake } from './types';

export interface IDiscordContextArgs extends ISystemContextArgs {
    readonly message: IDefaultMessage;
    readonly self: ISelfUser;
    isUserStaff(this: DiscordContext, user: IUser | Snowflake): Awaitable<boolean>;
}

export type DiscordGuildContext = DiscordContext & { message: GuildMessage };
export type DiscordDMContext = DiscordContext & { message: DMMessage };

export class DiscordContext extends SystemContext {
    public readonly type!: typeof DiscordContext;
    public readonly self: ISelfUser;
    public readonly message: IDefaultMessage;

    // @ts-ignore
    private readonly ['__DiscordContextDiscriminator__']: undefined;

    public constructor(engine: Engine<DiscordContext>, args: IDiscordContextArgs) {
        super(engine, args);
        this.self = args.self;
        this.message = args.message;
        this.isUserStaff = args.isUserStaff;
    }

    public isUserStaff(user: IUser): Awaitable<boolean> { throw user; }
}