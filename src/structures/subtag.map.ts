import { SubTag } from './subtag';
import { Context } from './context';

class SubTagMapNode extends Map<string, SubTagMapNode | SubTag<any>> { }

export class SubTagMap {
    private readonly _members: SubTag<any>[] = [];
    private readonly _map: SubTagMapNode = new SubTagMapNode();

    public members: ReadonlyArray<SubTag<any>> = this._members;

    public add(subtag: SubTag<any>): this {
        for (const path of this._getPaths(subtag)) {
            let node = this._getNode(path.slice(0, -1));
            let key = path[path.length - 1];
            node.set(key, subtag);
        }

        this._members.push(subtag);

        return this;
    }

    public remove(subtag: SubTag<any>): this {
        for (const path of this._getPaths(subtag)) {
            let node = this._getNode(path.slice(0, -1));
            let key = path[path.length - 1];
            if (node.get(key) === subtag)
                node.delete(key);
        }

        let index = this._members.indexOf(subtag);
        if (index != -1)
            this._members.splice(index, 1);

        return this;
    }

    public get(name: string): SubTag<any> | undefined {
        let path = name.toLowerCase().split('.');
        let node = this._getNode(path.slice(0, -1));
        let key = path[path.length - 1];

        let result = node.get(key);
        if (result === undefined || 'name' in result)
            return result;
        return undefined;
    }

    private _getPaths(subtag: SubTag<any>): string[][] {
        let root = subtag.category.toLowerCase().split('.');
        let paths = [subtag.name, ...subtag.aliases].map(key => [...root, ...key.toLowerCase().split('.')]);
        if (subtag.globalNames)
            paths.push(...subtag.globalNames.map(key => key.toLowerCase().split('.')));
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
