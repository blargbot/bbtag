import { Context } from "./structures/context";
import { IDatabase } from "./interfaces/idatabase";
export declare class Engine<TContext extends Context> {
    readonly database: IDatabase<TContext>;
    constructor(database: IDatabase<TContext>);
}
