import { Parser } from './parser';
import { SubtagToken, ExecutionContext, SubtagCollection, BBTag, OptimizationContext, StringToken } from './models';
import { optimizeStringToken } from './optimizer';
import { IDatabase } from './interfaces';

export class Engine {
    public parser: Parser;
    public readonly subtags: SubtagCollection;
    public readonly database: IDatabase;

    public constructor(database: IDatabase) {
        this.parser = new Parser();
        this.subtags = new SubtagCollection();
        this.database = database;
    }

    public async execute(string: StringToken, context: ExecutionContext): Promise<string> {
        let parts: string[] = [];
        for (const subtag of string.subtags) {
            parts.push(await this.executeSubtag(subtag, context));
        }
        return string.format.format(...parts);
    }

    private async executeSubtag(subtag: SubtagToken, context: ExecutionContext): Promise<string> {
        let name = await this.execute(subtag.name, context);
        let executor = context.findSubtag(name);
        if (executor === undefined) {
            return `\`Unknown subtag ${name}\``;
        }
        try {
            return await executor.execute(subtag, context) || '';
        } catch {
            return '`Internal server error`';
        }
    }

    public process(source: string): BBTag {
        let root = this.parser.parse(source);
        return {
            source: source,
            root: optimizeStringToken(root, new OptimizationContext(this))
        };
    }
}