import { IDatabase } from './interfaces';
import { ExecutionContext, IBBTag, IStringToken, ISubtagToken, OptimizationContext, SubtagCollection } from './models';
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

    public async execute(input: IStringToken, context: ExecutionContext): Promise<string> {
        const parts: string[] = [];
        for (const subtag of input.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        return util.format(input.format, parts);
    }

    public process(source: string): IBBTag {
        const root = this.parser.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(this))
        };
    }

    private async executeSubtag(input: ISubtagToken, context: ExecutionContext): Promise<string> {
        const name = await this.execute(input.name, context);
        const executor = context.findSubtag(name);
        if (executor === undefined) {
            return `\`Unknown subtag ${name}\``;
        }
        try {
            return await executor.execute(input, context) || '';
        } catch {
            return '`Internal server error`';
        }
    }
}