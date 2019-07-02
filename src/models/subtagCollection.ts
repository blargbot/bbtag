import { OptimizationContext, ExecutionContext, SubtagContext } from './context';
import { HardMap } from './hardMap';
import { ISubtag } from './subtag';

export class SubtagCollection implements Iterable<ISubtag<any>> {
    public readonly [Symbol.iterator]: () => IterableIterator<ISubtag<any>>;
    private readonly _nameMap: HardMap<string, ISubtag<any>>;
    private readonly _aliasMap: HardMap<string, ISubtag<any>>;

    public constructor() {
        this._nameMap = new HardMap();
        this._aliasMap = new HardMap();
        this[Symbol.iterator] = this._nameMap.values;
    }

    public register<T extends ExecutionContext>(...subtags: Array<ISubtag<T>>): void {
        for (const subtag of subtags) {
            this._nameMap.set(subtag.name.toLowerCase(), subtag);
            for (const alias of subtag.aliases) {
                this._aliasMap.set(alias.toLowerCase(), subtag);
            }
        }
    }

    public remove<T extends ExecutionContext>(subtag: ISubtag<T>): boolean;
    public remove<T extends ExecutionContext>(subtag: ISubtag<T>, ...subtags: Array<ISubtag<T>>): boolean[];
    public remove<T extends ExecutionContext>(...subtags: Array<ISubtag<T>>): boolean[] | boolean {
        const result = [];
        for (const subtag of subtags) {
            let found = this._nameMap.delete(subtag.name.toLowerCase());
            for (const alias of subtag.aliases) {
                found = this._aliasMap.delete(alias.toLowerCase()) || found;
            }
            result.push(found);
        }
        if (result.length === 1) {
            return result[0];
        }
        return result;
    }

    public findSubtag(context: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<T extends ExecutionContext>(context: T, name: string): ISubtag<T> | undefined;
    public findSubtag(context: SubtagContext, name: string): ISubtag<any> | undefined {
        name = name.toLowerCase();
        const subtag = this._nameMap.get(name) || this._aliasMap.get(name);
        if (subtag === undefined || context instanceof subtag.context || context instanceof OptimizationContext) {
            return subtag;
        }
    }
}