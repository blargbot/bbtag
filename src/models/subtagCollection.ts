import { SubtagContext, OptimizationContext } from './context';
import { ISubtag } from './subtag';
import { Enumerable } from '../util/enumerable';
import { HardMap } from './hardMap';

export class SubtagCollection implements Iterable<ISubtag<any>> {
    private readonly _nameMap: HardMap<string, ISubtag<any>>;
    private readonly _aliasMap: HardMap<string, ISubtag<any>>;
    private readonly _contextMap: HardMap<typeof SubtagContext, Set<ISubtag<any>>>;

    public constructor() {
        this._nameMap = new HardMap();
        this._aliasMap = new HardMap();
        this._contextMap = new HardMap(() => new Set());
    }

    public *[Symbol.iterator]() {
        yield* this._nameMap.values();
    }

    public register<TContext extends SubtagContext>(...subtags: ISubtag<TContext>[]): void {
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

    public remove<TContext extends SubtagContext>(subtag: ISubtag<TContext>): boolean;
    public remove<TContext extends SubtagContext>(subtag: ISubtag<TContext>, ...subtags: ISubtag<TContext>[]): boolean[];
    public remove<TContext extends SubtagContext>(...subtags: ISubtag<TContext>[]): boolean[] | boolean {
        let result = [];
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
    public listForContext<TContext extends SubtagContext>(context: TContext): Enumerable<ISubtag<TContext>>;
    public listForContext<TContext extends SubtagContext>(context: TContext): Enumerable<ISubtag<TContext>> {
        let type = Object.getPrototypeOf(context).constructor;
        if (type === OptimizationContext) {
            return Enumerable.from(this._nameMap.values());
        }
        return Enumerable.from(this._contextMap.get(type) || []);
    }

    public findSubtag(context: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<TContext extends SubtagContext>(context: TContext, name: string): ISubtag<TContext> | undefined;
    public findSubtag<TContext extends SubtagContext>(context: TContext, name: string): ISubtag<TContext> | undefined {
        name = name.toLowerCase();
        let subtag = this._nameMap.get(name) || this._aliasMap.get(name);
        let type = Object.getPrototypeOf(context).constructor;
        if (subtag === undefined || type === OptimizationContext || this._contextMap.get(type)!.has(subtag)) {
            return subtag;
        }
    }
}

const rootContext = Object.getPrototypeOf(SubtagContext);
const inheritanceCache = new Map<typeof SubtagContext, Array<typeof SubtagContext>>();

function getInheritance(context: typeof SubtagContext): ReadonlyArray<typeof SubtagContext> {
    let result = inheritanceCache.get(context);
    if (result !== undefined) {
        return result;
    } else {
        result = [];
        let parent = context;
        do {
            result.push(context);
            parent = Object.getPrototypeOf(parent);
        } while (parent != rootContext);
        inheritanceCache.set(context, result);
        return result;
    }
}