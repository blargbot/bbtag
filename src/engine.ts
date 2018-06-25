import { Context } from './structures/context';
import { IDatabase } from './interfaces/idatabase';
import { BBString, BBSubTag } from './language';
import { SubTagMap } from './structures/subtag.map';
import { system as sysError } from './structures/subtag.errors';
import { SubTag } from './structures/subtag';

export type ErrorHandler = (error: Error, caller: Engine, subtag: SubTag<any> | undefined, context: Context, part: BBSubTag) => void | Promise<void>;

export class Engine {
    public readonly subtags: SubTagMap = new SubTagMap();
    public readonly database: IDatabase;
    public readonly onFatal: ErrorHandler;
    public readonly onError: ErrorHandler;

    constructor(options: EngineOptions) {
        this.database = options.database;
        this.onFatal = options.onFatal || (() => { });
        this.onError = options.onError || (() => { });
    }

    public register(...subtags: Array<new (engine: Engine) => SubTag<any>>): this {
        for (const subtag of subtags)
            this.subtags.members.find(s => Object.getPrototypeOf(s) === subtag.prototype) ||
                this.subtags.add(new subtag(this));
        return this;
    }

    public remove(...subtags: Array<new (engine: Engine) => SubTag<any>>): this {
        for (const subtag of subtags)
            this.subtags.members.filter(s => Object.getPrototypeOf(s) === subtag.prototype)
                .map(s => this.subtags.remove(s));
        return this;
    }

    public async execute(bbstring: BBString, context: Context): Promise<string> {
        let result = [];
        for (const part of bbstring.parts) {
            if (context.state.return) break;
            if (typeof part === 'string') {
                result.push(part);
            } else {
                if (part.name === undefined) {
                    result.push(sysError.missingSubtag()(part, context));
                } else {
                    let subtag;
                    try {
                        let name = part.resolvedName = part.resolvedName || await this.execute(part.name, context);
                        if (context.state.return) break;

                        subtag = context.functions.get(name) || this.subtags.get(name);
                        if (subtag === undefined) {
                            result.push(sysError.unknownSubtag(name)(part, context));
                        } else {
                            result.push(await subtag.execute(part, context));
                        }
                    } catch (err) {
                        if (err instanceof FatalError) {
                            this.onFatal(err, this, subtag, context, part);
                            throw err;
                        }
                        result.push(sysError.internalError()(part, context));
                        this.onError(err, this, subtag, context, part);
                    }
                }
            }
        }
        return result.join('');
    }
}

export interface EngineOptions {
    database: IDatabase;
    onError?: ErrorHandler;
    onFatal?: ErrorHandler;
}

export class FatalError extends Error {

}