import { SubTag } from './subtag';
import { subtags } from '../subtags/general/system';

export class SubTagMap {
    private readonly _members: Set<SubTag<any>> = new Set();
    private readonly _map: { [key: string]: SubTag<any> } = {};
    private readonly _whenAdded: Map<any, Array<(subtag: SubTag<any>) => void>> = new Map();

    public get members(): ReadonlyArray<SubTag<any>> { return Array.from(this._members) };

    private getNames(subtag: SubTag<any>): string[] {
        let result: string[] = [];

        let names = [subtag.name, ...subtag.aliases];
        if (subtag.category)
            result.push(...names.map(name => `${subtag.category}.${name}`));

        if (subtag.globalNames)
            result.push(...subtag.globalNames);

        return result.map(name => name.toLowerCase());
    }

    public add(subtag: SubTag<any>): this {
        this._add(subtag);

        let waiting = this._whenAdded.get(Object.getPrototypeOf(subtag));

        if (waiting !== undefined) {
            for (const handler of waiting) {
                handler(subtag);
            }
        }

        return this;
    }

    private _add(subtag: SubTag<any>): this {
        for (const name of this.getNames(subtag)) {
            if (name in this._map) {
                throw new Error(`Subtag name ${name} already exists. Currently belongs to ${this._map[name].name}`);
            }
            this._map[name] = subtag;
        }

        this._members.add(subtag);

        return this;
    }

    public remove(subtag: SubTag<any>): this {
        return this._remove(subtag);
    }

    private _remove(subtag: SubTag<any>): this {
        for (const name of this.getNames(subtag)) {
            if (name in this._map && this._map[name] == subtag) {
                delete this._map[name];
            }
        }

        this._members.delete(subtag);

        return this;
    }

    public reload(subtag: SubTag<any>): this {
        if (this._members.has(subtag))
            this._remove(subtag)._add(subtag);

        return this;
    }

    public get(name: string): SubTag<any> | undefined {
        name = name.toLowerCase();
        if (name in this._map) {
            return this._map[name];
        }
    }

    public onceAdded(subtag: typeof SubTag, handler: (subtag: SubTag<any>) => void) {
        let existing = this.members.find(member => Object.getPrototypeOf(member) === subtag.prototype);
        if (existing !== undefined) {
            handler(existing);
        } else {
            let current = this._whenAdded.get(subtag.prototype);
            if (current === undefined)
                this._whenAdded.set(subtag.prototype, current = []);
            current.push(handler);
        }
    }
}
