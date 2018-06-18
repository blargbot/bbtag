import { Range } from './location';

type TagContext = {
    source: string;
    lines: string[];
}

export default abstract class BaseTag {
    private readonly _context: TagContext;

    public readonly parent: BaseTag;
    public readonly range: Range;
    public get source() { return this._context.source; }
    public get start() { return this.range.start; }
    public get end() { return this.range.end; }

    constructor(context: TagContext, parent: BaseTag, range: Range) {
        this._context = context;
        this.parent = parent;
        this.range = range;
    }
}