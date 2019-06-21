import { Engine } from '../engine';
import { ISubtag } from './subtag';
import { IDatabase } from '../interfaces';

export interface ExecutionResult {
    toString(): string;
    toNumber(): number;
}

export class SubtagContext {
    public readonly engine: Engine;
    public readonly overrides: SubtagCollection;
    private readonly tagName: string;
    public get database(): IDatabase { return this.engine.database };

    public constructor(engine: Engine, tagName: string) {
        this.engine = engine;
        this.overrides = new SubtagCollection();
        this.tagName = tagName;
    }

    public findSubtag(this: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<TContext extends SubtagContext>(this: TContext, name: string): ISubtag<TContext> | undefined;
    public findSubtag<TContext extends SubtagContext>(this: TContext, name: string): ISubtag<TContext> | undefined {
        return this.overrides.findSubtag(this, name) || this.engine.subtags.findSubtag(this, name);
    }
}

export class ExecutionContext extends SubtagContext {
    public constructor(engine: Engine, tagName: string) {
        super(engine, tagName);
    }
}

export class OptimizationContext extends SubtagContext {
    public constructor(engine: Engine) {
        super(engine, 'system_optimize');
    }
}

import { SubtagCollection } from './subtagCollection';