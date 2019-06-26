import { Engine } from '../engine';
import { IDatabase } from '../interfaces';
import { ISubtag } from './subtag';

export abstract class SubtagContext {
    public readonly engine: Engine;
    public readonly overrides: SubtagCollection;
    public readonly tagName: string;
    public get database(): IDatabase { return this.engine.database; }

    public constructor(engine: Engine, tagName: string) {
        this.engine = engine;
        this.overrides = new SubtagCollection();
        this.tagName = tagName;
    }

    public findSubtag(this: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<TContext extends ExecutionContext>(this: TContext, name: string): ISubtag<TContext> | undefined;
    public findSubtag<TContext extends ExecutionContext>(this: TContext, name: string): ISubtag<TContext> | undefined {
        return this.overrides.findSubtag(this, name) || this.engine.subtags.findSubtag(this, name);
    }
}

export class ExecutionContext extends SubtagContext {
    public constructor(engine: Engine, tagName: string) {
        super(engine, tagName);
    }

    public execute(token: IStringToken): Promise<StringExecutionResult> {
        return this.engine.execute(token, this);
    }
}

export class OptimizationContext extends SubtagContext {
    public constructor(engine: Engine) {
        super(engine, 'system_optimize');
    }
}

import { IStringToken } from './bbtag';
import { SubtagCollection } from './subtagCollection';
import { StringExecutionResult, SubtagExecutionResult } from './subtagResults';