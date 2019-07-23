import { Position } from './range';

export class Cursor {
    public readonly source: string;
    private _offset: number;
    private _line: number;
    private _column: number;
    private readonly _lines: string[];

    public get offset(): number { return this._offset; }
    public get line(): number { return this._line; }
    public get column(): number { return this._column; }
    public get nextChar(): undefined | string { return this.source[this._offset]; }
    public get prevChar(): undefined | string { return this.source[this._offset - 1]; }
    public get position(): Position { return new Position(this._offset, this._line, this._column); }

    public constructor(source: string) {
        this.source = source;
        this._offset = 0;
        this._line = 0;
        this._column = 0;
        this._lines = source.split('\n');
    }

    public move(count: number): boolean {
        let [offset, line, column] = [this._offset, this._line, this._column];
        const [step, front, back] = count > 0
            ? [1, () => this.source[offset], () => this.source[offset - 1]]
            : [-1, () => this.source[offset - 1], () => this.source[offset]];

        while (count !== 0 && front() !== undefined) {
            count -= step;
            offset += step;
            if (back() === '\n') {
                line += step;
                column = step === 1 ? 0 : this._lines[line].length;
            } else {
                column += step;
            }
        }

        if (count === 0) {
            this._offset = offset;
            this._column = column;
            this._line = line;
            return true;
        }

        return false;
    }
}