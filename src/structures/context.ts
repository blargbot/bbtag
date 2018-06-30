import { VariableManager } from './variables';
import { Scope } from './scope';
import { StateManager } from './state';
import { Engine } from '../engine';
import { BBString, BBSubTag } from '../language';
import { SubTag } from './subtag';
import { SubTagMap } from './subtag.map';

export class Context {
    public readonly engine: Engine;
    public readonly variables: VariableManager;
    public readonly scope: Scope;
    public readonly state: StateManager;
    public readonly runMode: RunMode;
    public readonly permission: Permission;
    public readonly functions: SubTagMap;
    public readonly arguments: string[];

    constructor(engine: Engine, options?: ContextOptions) {
        this.engine = engine;
        this.variables = new VariableManager(this, this.engine);
        this.scope = new Scope();
        this.state = new StateManager();
        this.functions = new SubTagMap();

        options = options || {};

        this.runMode = options.runMode || RunMode.restricted;
        this.permission = options.permission || Permission.low;
        this.arguments = options.arguments || [];
    }

    public addError(code: string, part: BBString | BBSubTag, message: string): string {
        let location = part.range.start;
        this.state.errors.push({ code, location, message });

        return `\`[${location.line + 1}:${location.column + 1}][${code}] ${message}\``;
    }

    public getSubTag(name: string): SubTag<any> | undefined {
        name = name.toLowerCase();
        if (name.startsWith(''))
            return this.functions.get(name);
        return this.engine.subtags.get(name);
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
    arguments?: string[];
    runMode?: RunMode;
    permission?: Permission;
}