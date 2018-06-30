import { Context } from './context';
import { Engine } from '../engine';

export class VariableManager {
    private readonly _map: { [key: string]: Promise<Variable> } = {};
    private readonly _engine: Engine;

    public readonly context: Context;

    constructor(context: Context, engine: Engine) {
        this._engine = engine;
        this.context = context;
    }

    getVariable(name: string): Promise<Variable> {
        let force = name.startsWith('!');
        if (force || !this._map.hasOwnProperty(name)) {
            if (force) name = name.substr(1);
            let current = this._engine.database.getVariable(this.context, name);
            this._map[name] = current.then(value => new Variable(value));
        }
        return this._map[name];
    }

    async getValue(name: string): Promise<string> {
        return (await this.getVariable(name)).value;
    }

    async setValue(name: string, value: string) {
        (await this.getVariable(name)).value = value;
    }

    async persist() {
        let promises = Object.keys(this._map).map(async key => {
            return {
                key,
                value: await this._map[key]
            };
        })
        let entries = await Promise.all(promises);
        let update = entries.filter(entry => entry.value.hasChanged).map(entry => {
            return {
                name: entry.key,
                value: entry.value.value
            };
        })

        await this._engine.database.setVariable(this.context, ...update);
    }
}

export class Variable {
    public get initial() { return this._initial; }
    public get hasChanged() { return this.initial != this.value; }

    private _initial: string;
    public value: string;

    constructor(value: string) {
        this._initial = this.value = value;
    }
}