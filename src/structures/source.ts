import { Enumerable } from './enumerable';
import { Range, Location } from './selection';

export class StringSource {
    public readonly content: string;
    private readonly lines: Enumerable<string>;
    public readonly range: Range;

    constructor(content: string) {
        this.content = content;
        this.lines = new Enumerable(content.split('\n'));
        this.range = new Range(new Location(0, 0), new Location(this.lines.count(), this.lines.last()!.length));
    }

    public get(range: Range): string {
        let lines = this.lines.slice(range.start.line, range.end.line + 1).toArray();
        lines[lines.length - 1] = lines[lines.length - 1].substring(0, range.end.column);
        lines[0] = lines[0].substring(range.start.column);
        return lines.join('\n');
    }
}