import { Engine } from './engine';
import { Converter } from './converter';
import { BBSubTag, BBString } from './structure';
import { Context } from './context';
import { Variable } from './dataTypes';
import { errors } from './errors';

export class ArgumentManager {
    private readonly engine: Engine;
    private readonly converter: Converter;
    public readonly subtag: BBSubTag;
    public readonly context: Context;

    public readonly ready: Promise<void>;

    constructor(engine: Engine, converter: Converter, definition: ArgumentDefinition[], subtag: BBSubTag, context: Context) {
        this.engine = engine;
        this.converter = converter;
        this.subtag = subtag;
        this.context = context;

        this.ready = new Promise((resolve, reject) => {
            reject(new Error('Not Implemented'));
        });
    }

    public async getArg(name: string, position?: number): Promise<BBString | BBSubTag> {
        let args = await this.getArgs(name, position);
        if (args.length === 1)
            return args[0];
        if (args.length === 0)
            throw errors.argument.missing(this.context, this.subtag, name, position);
        throw errors.argument.named.tooMany(this.context, this.subtag, name, position);
    }

    /**
     * Retrieves all the values provided to the subtag that have been associated with the `name` argument.
     * @param name The name of the argument to retrieve
     * @param position The position of the argument to retrieve if by name fails
     */
    public async getArgs(name: string, position?: number): Promise<Array<BBString | BBSubTag>> {
        await this.ready;
        throw new Error('Not Implemented');
    }

    public async getValue(name: string, position?: number): Promise<any> {
        let arg = await this.getArg(name, position);
        return this.engine.execute(arg, this.context);
    }

    public async getValueArray(name: string, position?: number): Promise<any[]> {
        let args = await this.getArgs(name, position);
        let result = [];
        for (const arg of args)
            result.push(await this.engine.execute(arg, context));
        return result;
    }

    public async getString(name: string, position?: number): Promise<string> {
        return this.converter.toString(await this.getValue(name, position));
    }

    public async getStringArray(name: string, position?: number): Promise<string[]> {
        let args = await this.getValueArray(name, position);
        return args.map(arg => this.converter.toString(arg));
    }

    public async getNumber(name: string, position?: number): Promise<number> {
        return this.converter.toNumber(await this.getArg(name, position));
    }

    public async getNumberArray(name: string, position?: number): Promise<number[]> {
        let args = await this.getValueArray(name, position);
        return args.map(arg => this.converter.toNumber(arg));
    }

    public async getReference(name: string, position?: number): Promise<Variable> {
        throw new Error('Not Implemented');
    }
}

export type ArgumentDefinition = {
    name: string;
    aliases?: string[];
    type: string;
    desc: string;
    default?: any;
    repeated?: boolean;
    conditional?: string;
    priority?: boolean;
};