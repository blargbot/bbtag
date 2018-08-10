import { BBSubTag, BBString, BBStructure } from './structure';
import { Engine } from './engine';
import { ArgumentError } from './errors';
import { ArgumentMap, Converter } from './dataTypes';
import { Context } from './context';

export abstract class SubTag {
    private readonly engine: Engine;

    public readonly arguments: ArgumentDefinition[] = [];
    public readonly converter: Converter = new Converter();

    constructor(engine: Engine) {
        this.engine = engine;
    }

    public async execute(subtag: BBSubTag, context: Context): Promise<any> {
        let args = await this.mapArgs(subtag, context);
        if ('message' in args)
            return args;
    }

    private async mapArgs(subtag: BBSubTag, context: Context): Promise<ArgumentMap | ArgumentError> {
        throw new Error('Not implemented');
    }
}

export type ArgumentDefinition = {
    name: string;
    aliases?: string[];
    type: string;
    desc: string;
    optional?: boolean;
    repeated?: boolean;
    conditional?: string;
    priority?: boolean;
};