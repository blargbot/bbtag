import { IDatabase } from './interfaces';
import {
    createStringResult,
    createSubtagResult,
    ExecutionContext,
    IBBTag,
    IStringToken,
    ISubtagToken,
    OptimizationContext,
    StringExecutionResult,
    SubtagCollection,
    SubtagExecutionResult
} from './models';
import { ChainedError } from './models/errors';
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

    public async execute(input: IStringToken, context: ExecutionContext): Promise<StringExecutionResult> {
        const parts: SubtagExecutionResult[] = [];
        for (const subtag of input.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        return createStringResult(input.format, parts);
    }

    public process(source: string): IBBTag {
        const root = this.parser.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(this))
        };
    }

    protected async executeSubtag(input: ISubtagToken, context: ExecutionContext): Promise<SubtagExecutionResult> {
        const name = await this.execute(input.name, context);
        const executor = context.findSubtag(name.getString());
        if (executor === undefined) {
            return createSubtagResult(new Error(`Unknown subtag ${name}`));
        }
        try {
            return await executor.execute(input, context) || '';
        } catch (ex) {
            return createSubtagResult(new ChainedError('Internal server error', ex));
        }
    }
}