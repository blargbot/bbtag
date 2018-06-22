import { Context, ContextOptions } from "../context";
import { IMessage, IChannel, IGuildChannel, IUser, IMember, IGuild, Snowflake } from '../../interfaces/iclient';
import { Engine } from "../../engine";

export class DiscordContext extends Context {
    public readonly message: IMessage;
    public readonly channel: IChannel;
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

        if (this.channel.hasOwnProperty('guild')) {
            this.guildChannel = this.channel as IGuildChannel;
            this.guild = this.guildChannel.guild;
        }
    }
}