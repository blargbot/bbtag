import { Engine } from '..';
import { ISystemContextArgs, SystemContext } from '../system';
import { DMMessage, GuildMessage, IDefaultMessage, ISelfUser, IUser } from './types';

export interface IDiscordContextArgs extends ISystemContextArgs {
    readonly message: IDefaultMessage;
    readonly self: ISelfUser;
    isUserStaff(this: DiscordContext, user: IUser): Promise<boolean>;
}

export type DiscordGuildContext = DiscordContext & { message: GuildMessage };
export type DiscordDMContext = DiscordContext & { message: DMMessage };

export class DiscordContext extends SystemContext {
    public readonly type!: typeof DiscordContext;
    public readonly self: ISelfUser;
    public readonly message: IDefaultMessage;

    public constructor(engine: Engine<typeof DiscordContext>, args: IDiscordContextArgs) {
        super(engine, args);
        this.self = args.self;
        this.message = args.message;
        this.isUserStaff = args.isUserStaff;
    }

    public isUserStaff(user: IUser): Promise<boolean> { throw user; }
}