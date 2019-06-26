import { Enumerable } from '../util/enumerable';
import { OptimizationContext, ExecutionContext } from './context';
import { HardMap } from './hardMap';
import { ISubtag } from './subtag';

export class SubtagCollection implements Iterable<ISubtag<any>> {
    public readonly [Symbol.iterator]: () => IterableIterator<ISubtag<any>>;
    private readonly _nameMap: HardMap<string, ISubtag<any>>;
    private readonly _aliasMap: HardMap<string, ISubtag<any>>;
    private readonly _contextMap: HardMap<typeof ExecutionContext, Set<ISubtag<any>>>;

    public constructor() {
        this._nameMap = new HardMap();
        this._aliasMap = new HardMap();
        this._contextMap = new HardMap(() => new Set());
        this[Symbol.iterator] = this._nameMap.values;
    }

    public register<T extends ExecutionContext>(...subtags: Array<ISubtag<T>>): void {
        for (const subtag of subtags) {
            this._nameMap.set(subtag.name.toLowerCase(), subtag);
            for (const alias of subtag.aliases) {
                this._aliasMap.set(alias.toLowerCase(), subtag);
            }
            for (const context of getInheritance(subtag.contextType)) {
                this._contextMap.get(context)!.add(subtag);
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
            for (const context of getInheritance(subtag.contextType)) {
                found = this._contextMap.get(context)!.delete(subtag) || found;
            }
            result.push(found);
        }
        if (result.length === 1) {
            return result[0];
        }
        return result;
    }

    public listForContext(context: OptimizationContext): Enumerable<ISubtag<any>>;
    public listForContext<T extends ExecutionContext>(context: T): Enumerable<ISubtag<T>>;
    public listForContext<T extends ExecutionContext>(context: T): Enumerable<ISubtag<T>> {
        const type = Object.getPrototypeOf(context).constructor;
        if (type === OptimizationContext) {
            return Enumerable.from(this._nameMap.values());
        }
        return Enumerable.from(this._contextMap.get(type) || []);
    }

    public findSubtag(context: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<T extends ExecutionContext>(context: T, name: string): ISubtag<T> | undefined;
    public findSubtag<T extends ExecutionContext>(context: T, name: string): ISubtag<T> | undefined {
        name = name.toLowerCase();
        const subtag = this._nameMap.get(name) || this._aliasMap.get(name);
        const type = Object.getPrototypeOf(context).constructor;
        if (subtag === undefined || type === OptimizationContext || this._contextMap.get(type)!.has(subtag)) {
            return subtag;
        }
    }
}

const rootContext = Object.getPrototypeOf(ExecutionContext);
const inheritanceCache = new Map<typeof ExecutionContext, Array<typeof ExecutionContext>>();

function getInheritance(context: typeof ExecutionContext): ReadonlyArray<typeof ExecutionContext> {
    let result = inheritanceCache.get(context);
    if (result !== undefined) {
        return result;
    } else {
        result = [];
        let parent = context;
        do {
            result.push(context);
            parent = Object.getPrototypeOf(parent);
        } while (parent !== rootContext);
        inheritanceCache.set(context, result);
        return result;
    }
}