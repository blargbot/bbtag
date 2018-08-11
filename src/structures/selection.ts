export class Location {
    public static AreEqual(l1: Location, l2: Location) {
        return l1.column === l2.column
            && l1.line === l2.line;
    }

    public readonly column: number;
    public readonly line: number;

    constructor(line: number, column: number) {
        this.line = line;
        this.column = column;
    }

    public Equals(other: Location) {
        return Location.AreEqual(this, other);
    }

    public toString(braces: boolean = false) {
        let result = `${this.column},${this.line}`;
        if (braces)
            return `[${result}]`;
        return result;
    }
}

export class Range {
    public static AreEqual(r1: Range, r2: Range) {
        return Location.AreEqual(r1.start, r2.start)
            && Location.AreEqual(r1.end, r2.end);
    }

    public readonly start: Location;
    public readonly end: Location;

    constructor(start: Location, end: Location) {
        this.start = start;
        this.end = end;
    }

    public Equals(other: Range) {
        return Range.AreEqual(this, other);
    }

    public toString(braces: boolean = false) {
        let result = `${this.start}-${this.end}`;
        if (braces)
            return `[${result}]`;
        return result;
    }
}