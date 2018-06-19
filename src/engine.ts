import { Context } from "./structures/context";
import { IDatabase } from "./interfaces/idatabase";

export class Engine<TContext extends Context> {
    public readonly database: IDatabase<TContext>;

    constructor(database: IDatabase<TContext>) {
        this.database = database;
    }
}