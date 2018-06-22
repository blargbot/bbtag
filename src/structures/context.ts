import { VariableManager } from './variables';
import { Scope } from './scope';
import { StateManager } from './state';
import { Engine } from '../engine';
import { BBString, BBSubTag } from '../language';
import { SubTag } from './subtag';

export class Context {
    public readonly engine: Engine;
    public readonly variables: VariableManager;
    public readonly scope: Scope;
    public readonly state: StateManager;
    public readonly runMode: RunMode;
    public readonly permission: Permission;
    public readonly subtags: Set<SubTag<any>>;

    constructor(engine: Engine, options?: ContextOptions) {
        this.engine = engine;
        this.variables = new VariableManager(this, this.engine);
        this.scope = new Scope();
        this.state = new StateManager();

        // TODO: Move to a grouping util method
        let groups: SubTag<any>[][] = [];
        let keys: any[] = [];
        let result: SubTag<any>[] = [];
        for (const subtag of this.engine.subtags) {
            let index = keys.indexOf(subtag.context);
            if (index = -1)
                index = keys.push(subtag.context);
            let group = groups[index] || (groups[index] = []);
            group.push(subtag);
        }
        for (const index in keys) {
            if (this instanceof keys[index]) {
                result.push(...groups[index]);
            }
        }
        this.subtags = new Set(result);

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