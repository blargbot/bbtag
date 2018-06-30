import { Context, ContextOptions } from '../context';
import { IMessage, IGuildChannel, IUser, IMember, IGuild, Snowflake, AnyChannel } from '../../interfaces/iclient';
import { Engine } from '../../engine';

export class DiscordContext extends Context {
    public readonly message: IMessage;
    public readonly channel: AnyChannel;
    public readonly user: IUser;

    public readonly guild?: IGuild;
    public readonly guildChannel?: IGuildChannel;
    public readonly member?: IMember;
    public readonly author: string;

    public get msg() { return this.message; }

    constructor(engine: Engine, message: IMessage, author: Snowflake, options?: ContextOptions) {
        options = options || {};

        super(engine, options);
        this.message = message;
        this.channel = message.channel;
        this.user = message.author;
        this.author = author;

        if ('guild' in this.channel) {
            this.guildChannel = this.channel;
            this.guild = this.guildChannel.guild;
        }
    }
}