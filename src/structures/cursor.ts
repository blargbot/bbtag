import { Location } from './selection';

export class Cursor {
    private _characters: string[];
    private _lines: number[];
    private _location?: Location;

    public position: number;
    public get next(): string { return this._characters[this.position]; }
    public get prev(): string { return this._characters[this.position - 1]; }
    public get location(): Location {
        if (this._location) return this._location;

        let offset = this.position;
        let line = 0;
        while (offset > this._lines[line])
            offset -= this._lines[line++];
        return this._location = new Location(line, offset);
    }

    constructor(source: string) {
        this._characters = Array.from(source);
        this._lines = source.split('\n').map(line => Array.from(line + '\n').length);
        this.position = 0;
    }

    public moveNext(): boolean {
        if (this.position >= this._characters.length)
            return false;
        this.position++;
        this._location = undefined;
        return true;
    }

    public moveBack(): boolean {
        if (this.position <= 0)
            return false;
        this.position--;
        this._location = undefined;
        return true;
    }
}