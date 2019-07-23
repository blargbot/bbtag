import { BBTagEngine } from '../../engine';
import { DMMessage, GuildMessage, IDefaultMessage, ISelfUser, IUser } from '../../external';
import { Context as SystemContext, ISubtagContextArgs } from '../system';

export interface IDiscordContextArgs extends ISubtagContextArgs {
    readonly message: IDefaultMessage;
    readonly self: ISelfUser;
    isUserStaff(this: DiscordContext, user: IUser): Promise<boolean>;
}

export type GuildContext = DiscordContext & { message: GuildMessage };
export type DMContext = DiscordContext & { message: DMMessage };

export class DiscordContext extends SystemContext {
    public readonly type!: typeof DiscordContext;
    public readonly self: ISelfUser;
    public readonly message: IDefaultMessage;

    public constructor(engine: BBTagEngine<typeof DiscordContext>, args: IDiscordContextArgs) {
        super(engine, args);
        this.self = args.self;
        this.message = args.message;
        this.isUserStaff = args.isUserStaff;
    }

    public isUserStaff(user: IUser): Promise<boolean> { throw user; }
}