import { BBSubTag, BBString, BBStructure } from './structure';
import { Engine } from './engine';
import { Converter } from './converter';
import { Context } from './context';
import { ArgumentManager, ArgumentDefinition } from './arguments';

export abstract class SubTag {
    protected readonly engine: Engine;

    public readonly arguments: ArgumentDefinition[] = [];
    public readonly converter: Converter;

    constructor(engine: Engine) {
        this.engine = engine;
        this.converter = new Converter(engine.database);
    }

    public async execute(subtag: BBSubTag, context: Context): Promise<any> {
        let args = new ArgumentManager(this.engine, this.converter, this.arguments, subtag, context);

    }
}