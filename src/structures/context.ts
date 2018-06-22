import { VariableManager } from './variables';
import { IMessage, IChannel, IGuildChannel, IUser, IMember, IGuild, Snowflake } from '../interfaces/iclient';
import { Scope } from './scope';
import { StateManager } from './state';
import { Engine } from '../engine';
import { BBString, BBSubTag } from '../language';

export class Context {
    public readonly engine: Engine;
    public readonly variables: VariableManager;
    public readonly scope: Scope;
    public readonly state: StateManager;
    public readonly runMode: RunMode;
    public readonly permission: Permission;

    constructor(engine: Engine, options?: ContextOptions) {
        this.engine = engine;
        this.variables = new VariableManager(this, this.engine);
        this.scope = new Scope();
        this.state = new StateManager();

        options = options || {};

        this.runMode = options.runMode || RunMode.restricted;
        this.permission = options.permission || Permission.low;
    }

    public addError(code: string, part: BBString | BBSubTag, message: string): string {
        let location = part.range.start;
        this.state.errors.push({ code, location, message });

        return `\`[${location.line}:${location.column}][${code}] ${message}\``;
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