import { DatabaseValue, Enumerable, IDatabase } from '..'; // 'bbtag'

// tslint:disable: interface-over-type-literal
type DatabaseNode = { [key: string]: DatabaseNode | DatabaseValue };
type DatabaseValueNode = { [key: string]: DatabaseValue };
// tslint:enable: interface-over-type-literal

export class InMemoryDatabase implements IDatabase {
    private readonly _database: DatabaseNode;

    public constructor() {
        this._database = {};
    }

    public delete(path: Iterable<string>): void {
        const [parent, key] = this.find(path);
        delete parent[key];
    }

    public get(path: Iterable<string>): DatabaseValue {
        const [parent, key] = this.find(path);
        return parent[key];
    }

    public set(path: Iterable<string>, values: DatabaseValue): void {
        const [parent, key] = this.find(path);
        parent[key] = values;
    }

    public setBulk(entries: Iterable<readonly [Iterable<string>, DatabaseValue]>): void {
        for (const [path, value] of entries) {
            this.set(path, value);
        }
    }

    private find(path: Iterable<string>): [DatabaseValueNode, string] {
        const enumerator = Enumerable.from(path).getEnumerator();
        let parent = this._database;
        if (!enumerator.moveNext()) { throw new Error('databse path is empty'); }
        let key = enumerator.current;
        while (enumerator.moveNext()) {
            let next = parent[key];
            if (typeof next === 'undefined') {
                parent[key] = next = {};
            } else if (!isDbNode(next)) {
                throw new Error(`Part of the database path ${[...path].join('.')} is a value, not a node`);
            }
            parent = next;
            key = enumerator.current;
        }

        if (typeof parent[key] !== undefined && isDbNode(parent[key])) {
            throw new Error(`The database path ${[...path].join('.')} is a node, not a value`);
        }

        return [parent as DatabaseValueNode, key];
    }
}

function isDbNode(value: DatabaseNode | DatabaseValue): value is DatabaseNode {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}