import { IDatabase } from './interfaces';
import {
    ExecutionContext,
    IBBTag,
    IStringToken,
    ISubtagToken,
    OptimizationContext,
    SubtagCollection,
    SubtagError,
    SubtagResult
} from './models';
import { optimizeStringToken } from './optimizer';
import { Parser } from './parser';
import { default as util } from './util';

export class Engine {
    public parser: Parser;
    public readonly subtags: SubtagCollection;
    public readonly database: IDatabase;

    public constructor(database: IDatabase) {
        this.parser = new Parser();
        this.subtags = new SubtagCollection();
        this.database = database;
    }

    public async execute(input: IStringToken, context: ExecutionContext): Promise<SubtagResult> {
        const parts: SubtagResult[] = [];
        for (const subtag of input.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        if (parts.length === 1 && util.format(input.format, '') === '') {
            return parts[0];
        } else {
            return util.format(input.format, parts.map(util.subtag.toString));
        }
    }

    public process(source: string): IBBTag {
        const root = this.parser.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(this))
        };
    }

    protected async executeSubtag(input: ISubtagToken, context: ExecutionContext): Promise<SubtagResult> {
        const name = util.subtag.toString(await this.execute(input.name, context));
        const executor = context.findSubtag(name);
        if (executor === undefined) {
            return new SubtagError(`Unknown subtag ${name}`, input);
        }
        try {
            return await executor.execute(input, context);
        } catch (ex) {
            return new SubtagError('Internal server error', ex, input);
        }
    }
}