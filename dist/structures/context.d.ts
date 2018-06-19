import { VariableManager } from "./variables";
import { IMessage, IChannel, IGuildChannel, IUser, IMember, IGuild, Snowflake } from "../interfaces/iclient";
import { Scope } from "./scope";
import { StateManager } from "./state";
import { Engine } from "../engine";
export declare class Context {
    readonly engine: Engine<this>;
    readonly variables: VariableManager<this>;
    readonly scope: Scope;
    readonly state: StateManager;
    readonly runMode: RunMode;
    readonly permission: Permission;
    constructor(engine: Engine<Context>, options?: ContextOptions);
    serialize(): void;
}
export declare class DiscordContext extends Context {
    readonly message: IMessage;
    readonly channel: IChannel;
    readonly user: IUser;
    readonly guild?: IGuild;
    readonly guildChannel?: IGuildChannel;
    readonly member?: IMember;
    readonly author: string;
    readonly msg: IMessage;
    constructor(engine: Engine<DiscordContext>, message: IMessage, author: Snowflake, options?: ContextOptions);
}
export declare enum RunMode {
    full = 1,
    restricted = 2
}
export declare enum Permission {
    admin = 1,
    elevated = 2,
    low = 3
}
export interface ContextOptions {
    runMode?: RunMode;
    permission?: Permission;
}
