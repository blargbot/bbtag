import { Range } from './location';
declare type TagContext = {
    source: string;
    lines: string[];
};
export default abstract class BaseTag {
    private readonly _context;
    readonly parent: BaseTag;
    readonly range: Range;
    readonly source: string;
    readonly start: import("../../../../Projects/BBTag/src/structures/location").Location;
    readonly end: import("../../../../Projects/BBTag/src/structures/location").Location;
    constructor(context: TagContext, parent: BaseTag, range: Range);
}
export {};
