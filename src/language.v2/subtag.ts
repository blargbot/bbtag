import { BBSubTag, BBString, BBStructure } from './structure';
import { Engine } from './engine';
import { Converter } from './converter';
import { Context } from './context';
import { ArgumentManager, ArgumentDefinition } from './arguments';
import { Enumerable } from '../structures/enumerable';

type SubTagHandler<TThis> = {
    condition: SubTagCallBack<TThis, boolean>;
    callback: SubTagCallBack<TThis, any>;
};

type SubTagCallBack<TThis, TResult> = (this: TThis, args: ArgumentManager) => Promise<TResult>;

interface SubTagOptions {
    readonly name: string;
    readonly engine: Engine;
    readonly converter?: Converter;
    readonly aliases?: ReadonlyArray<string>;
    readonly description: string;
    readonly arguments: ReadonlyArray<ArgumentDefinition>;
}

export abstract class SubTag {
    private readonly handlers: SubTagHandler<this>[] = [];
    private defaultHandler?: SubTagCallBack<this, any>;

    protected readonly options: SubTagOptions;

    public get engine() { return this.options.engine; }
    public get database() { return this.engine.database; }
    public readonly converter: Converter;
    public get name() { return this.options.name; }
    public get aliases() { return this.options.aliases; }
    public readonly names: ReadonlyArray<string>;
    public get arguments() { return this.options.arguments; }
    public get description() { return this.options.description; }

    constructor(options: SubTagOptions) {
        this.options = options;

        this.converter = this.options.converter || new Converter(this.database);
        this.names = [this.name, ...this.aliases || []];
    }

    public async execute(subtag: BBSubTag, context: Context): Promise<any> {
        let args = new ArgumentManager(this.engine, this.converter, this.arguments, subtag, context);
        await args.ready;

        for (const handler of this.handlers)
            if (await handler.condition.call(this, args))
                return await handler.callback.call(this, args);

        if (this.defaultHandler)
            return await this.defaultHandler.call(this, args);

        throw new MissingHandlerError(this, args);
    }

    protected whenGiven(...names: string[]): HandlerDefinitionContext<this> {
        return new HandlerDefinitionContext(this.handlers).andGiven(...names);
    }

    protected whenNotGiven(...names: string[]): HandlerDefinitionContext<this> {
        return new HandlerDefinitionContext(this.handlers).andNotGiven(...names);
    }

    protected when(conditon: SubTagCallBack<this, boolean>): HandlerDefinitionContext<this> {
        return new HandlerDefinitionContext(this.handlers).and(conditon);
    }

    protected default(callback: SubTagCallBack<this, any>) {
        this.defaultHandler = callback;
    }
}

class HandlerDefinitionContext<TSubTag> {
    private readonly handlers: SubTagHandler<TSubTag>[];
    private readonly conditions: SubTagCallBack<TSubTag, boolean>[] = [];

    constructor(handlers: SubTagHandler<TSubTag>[]) {
        this.handlers = handlers;
    }

    public andGiven(...names: string[]): this {
        let _names = Enumerable.from(names);
        return this.and(async args => _names.all(name => args.hasArg(name)));
    }

    public andNotGiven(...names: string[]): this {
        let _names = Enumerable.from(names);
        return this.and(async args => _names.all(name => !args.hasArg(name)));
    }

    public and(condition: SubTagCallBack<TSubTag, boolean>): this {
        this.conditions.push(condition);
        return this;
    }

    public call(callback: SubTagCallBack<TSubTag, any>) {
        let self = this;
        this.handlers.push({
            callback: callback,
            condition: async function (args: ArgumentManager) {
                return Enumerable.from(
                    await Promise.all(
                        self.conditions.map(c => c.call(this, args))
                    )
                ).all();
            }
        });

        for (const key in this)
            if (typeof this[key] === 'function')
                this[key] = <any>function () { throw Error('Handler has already been generated'); };
    }
}

export class MissingHandlerError extends Error {
    public subtag: SubTag;
    public args: ArgumentManager;

    constructor(subtag: SubTag, args: ArgumentManager) {
        super(`Missing handler on ${subtag.name}`);
        this.subtag = subtag;
        this.args = args;
    }
}