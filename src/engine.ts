import { IDatabase } from './interfaces';
import { BBTag, ExecutionContext, OptimizationContext, StringToken, SubtagCollection, SubtagToken } from './models';
import { optimizeStringToken } from './optimizer';
import { Parser } from './parser';

export class Engine {
    public parser: Parser;
    public readonly subtags: SubtagCollection;
    public readonly database: IDatabase;

    public constructor(database: IDatabase) {
        this.parser = new Parser();
        this.subtags = new SubtagCollection();
        this.database = database;
    }

    public async execute(input: StringToken, context: ExecutionContext): Promise<string> {
        const parts: string[] = [];
        for (const subtag of input.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        return input.format.format(...parts);
    }

    public process(source: string): BBTag {
        const root = this.parser.parse(source);
        return {
            source,
            root: optimizeStringToken(root, new OptimizationContext(this))
        };
    }

    private async executeSubtag(input: SubtagToken, context: ExecutionContext): Promise<string> {
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