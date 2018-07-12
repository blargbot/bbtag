import { SubTag } from './subtag';

export class SubTagMap {
    private readonly _members: Set<SubTag<any>> = new Set();
    private readonly _map: { [key: string]: SubTag<any> } = {};

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
        for (const name of this.getNames(subtag)) {
            if (name in this._map && this._map[name] == subtag) {
                delete this._map[name];
            }
        }

        this._members.delete(subtag);

        return this;
    }

    public get(name: string): SubTag<any> | undefined {
        name = name.toLowerCase();
        if (name in this._map) {
            return this._map[name];
        }
    }
}
