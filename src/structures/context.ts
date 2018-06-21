import { VariableManager } from './variables';
import { IMessage, IChannel, IGuildChannel, IUser, IMember, IGuild, Snowflake } from '../interfaces/iclient';
import { Scope } from './scope';
import { StateManager } from './state';
import { Engine } from '../engine';

export class Context {
    public readonly engine: Engine<this>;
    public readonly variables: VariableManager<this>;
    public readonly scope: Scope;
    public readonly state: StateManager;
    public readonly runMode: RunMode;
    public readonly permission: Permission;

    constructor(engine: Engine<Context>, options?: ContextOptions) {
        this.engine = engine;
        this.variables = new VariableManager(this, this.engine);
        this.scope = new Scope();
        this.state = new StateManager();

        options = options || {};

        this.runMode = options.runMode || RunMode.restricted;
        this.permission = options.permission || Permission.low;
    }
}

export class DiscordContext extends Context {
    public readonly message: IMessage;
    public readonly channel: IChannel;
    public readonly user: IUser;

    public readonly guild?: IGuild;
    public readonly guildChannel?: IGuildChannel;
    public readonly member?: IMember;
    public readonly author: string;

    public get msg() { return this.message; }

    constructor(engine: Engine<DiscordContext>, message: IMessage, author: Snowflake, options?: ContextOptions) {
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

export enum RunMode {
    full = 1, // cc's
    restricted = 2 // tags
}
export enum Permission {
    admin = 1, // bot owner
    elevated = 2, // staff
    low = 3 // user
}

export interface ContextOptions {
    runMode?: RunMode;
    permission?: Permission;
}