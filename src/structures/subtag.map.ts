import { SubTag } from "./subtag";
import { Context } from "./context";

class SubTagMapNode extends Map<string, SubTagMapNode | SubTag<any>> { }

export class SubTagMap {
    private readonly _members: Set<SubTag<any>> = new Set();
    private readonly _map: SubTagMapNode = new SubTagMapNode();

    public get members(): Array<SubTag<any>> { return [...this._members]; }

    public add(subtag: SubTag<any>): this {
        for (const path of this._getPaths(subtag)) {
            let node = this._getNode(path.slice(0, -1));
            let key = path[path.length - 1];
            node.set(key, subtag);
        }

        this._members.add(subtag);

        return this;
    }

    public remove(subtag: SubTag<any>): this {
        for (const path of this._getPaths(subtag)) {
            let node = this._getNode(path.slice(0, -1));
            let key = path[path.length - 1];
            if (node.get(key) === subtag)
                node.delete(key);
        }

        this._members.delete(subtag);

        return this;
    }

    public get(name: string): SubTag<any> | undefined {
        let path = name.split('.');
        let node = this._getNode(path.slice(0, -1));
        let key = path[path.length - 1];

        let result = node.get(key);
        if (result === undefined || 'name' in result)
            return result;
        return undefined;
    }

    private _getPaths(subtag: SubTag<any>): string[][] {
        let root = subtag.category.split('.');
        let paths = [subtag.name, ...subtag.aliases].map(key => [...root, ...key.split('.')]);
        if (subtag.globalNames)
            paths.push(...subtag.globalNames.map(key => key.split('.')));
        return paths;
    }

    private _getNode(path: string[]): SubTagMapNode {
        let node = this._map;
        for (const part of path) {
            let next = node.get(part);
            if (next === undefined)
                node.set(part, node = new SubTagMapNode());
            else if ('name' in next)
                throw new Error(`Path conflict ${path.join('.')} at ${part}`);
            else
                node = next;
        }
        return node;
    }
}
