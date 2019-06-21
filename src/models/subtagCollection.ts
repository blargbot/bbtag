import { SubtagContext, OptimizationContext } from './context';
import { ISubtag } from './subtag';
import { Enumerable } from '../util/enumerable';

export class SubtagCollection implements Iterable<ISubtag<any>> {
    private readonly _subtags: Map<typeof SubtagContext, Set<ISubtag<any>>>
    private readonly _contextMap: Map<typeof SubtagContext, Array<typeof SubtagContext>>;

    public constructor() {
        this._subtags = new Map();
        this._contextMap = new Map();
    }

    public *[Symbol.iterator]() {
        yield* Enumerable.from(this._subtags).selectMany(s => s[1]).toIterable()
    }

    public register<TContext extends SubtagContext>(...subtags: ISubtag<TContext>[]): void {
        for (const subtag of subtags) {
            if (!this._contextMap.has(subtag.contextType)) {
                this._contextMap.set(subtag.contextType, Enumerable.from(getInheritance(subtag.contextType)).toArray());
                this._subtags.set(subtag.contextType, new Set());
            }

            this._subtags.get(subtag.contextType)!.add(subtag);
        }
    }

    public remove<TContext extends SubtagContext>(subtag: ISubtag<TContext>): boolean;
    public remove<TContext extends SubtagContext>(subtag: ISubtag<TContext>, ...subtags: ISubtag<TContext>[]): boolean[];
    public remove<TContext extends SubtagContext>(...subtags: ISubtag<TContext>[]): boolean[] | boolean {
        let results = [];
        for (const subtag of subtags) {
            let found = false;
            for (const context of getInheritance(subtag.contextType)) {
                let set = this._subtags.get(context);
                if (set) {
                    found = set.delete(subtag) || found;
                }
            }
            results.push(found);
        }
        if (results.length == 1) {
            return results[0];
        }
        return results;
    }

    public listForContext(context: OptimizationContext): Enumerable<ISubtag<any>>;
    public listForContext<TContext extends SubtagContext>(context: TContext): Enumerable<ISubtag<TContext>>;
    public listForContext<TContext extends SubtagContext>(context: TContext): Enumerable<ISubtag<TContext>> {
        const ctor = Object.getPrototypeOf(context).constructor;
        if (ctor === OptimizationContext) {
            return Enumerable.from(this._subtags).selectMany(s => s[1]);
        }
        let contexts = this._contextMap.get(ctor);
        if (!contexts) {
            return Enumerable.empty<ISubtag<TContext>>();
        }

        return Enumerable.from(contexts).selectMany(c => this._subtags.get(c)!);
    }

    public findSubtag(context: OptimizationContext, name: string): ISubtag<any> | undefined;
    public findSubtag<TContext extends SubtagContext>(context: TContext, name: string): ISubtag<TContext> | undefined;
    public findSubtag<TContext extends SubtagContext>(context: TContext, name: string): ISubtag<TContext> | undefined {
        const byAlias: ISubtag<TContext>[] = [];
        name = name.toLowerCase();
        for (const subtag of this.listForContext(context).toIterable()) {
            if (subtag.name == name) {
                return subtag;
            }
            if (subtag.aliases.has(name)) {
                byAlias.push(subtag);
            }
        }
        if (byAlias.length == 1) {
            return byAlias[0];
        }
    }
}

const rootContext = Object.getPrototypeOf(SubtagContext);

function* getInheritance(context: new (...args: any[]) => SubtagContext): Iterable<typeof SubtagContext> {
    do {
        yield context;
        context = Object.getPrototypeOf(context);
    } while (context != rootContext);
}