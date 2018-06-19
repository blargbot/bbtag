import { Context } from "./context";
import { Engine } from "../engine";
export declare class VariableManager<TContext extends Context> {
    private readonly _map;
    private readonly _engine;
    readonly context: TContext;
    constructor(context: TContext, engine: Engine<TContext>);
    getVariable(name: string): Promise<Variable>;
    getValue(name: string): Promise<string>;
    setValue(name: string, value: string): Promise<void>;
    persist(): Promise<void>;
}
export declare class Variable {
    readonly initial: string;
    readonly hasChanged: boolean;
    private _initial;
    value: string;
    constructor(value: string);
}
