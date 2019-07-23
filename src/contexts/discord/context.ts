import { BBTagEngine } from '../../engine';
import { IDefaultMessage, ISelfUser, IUser } from '../../external';
import { Context as SubtagContext, ISubtagContextArgs } from '../system';

export interface IDiscordContextArgs extends ISubtagContextArgs {
    readonly message: IDefaultMessage;
    readonly self: ISelfUser;
    isUserStaff(this: DiscordContext, user: IUser): Promise<boolean>;
}

export class DiscordContext extends SubtagContext {
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