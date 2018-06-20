export class Location {
    public static AreEqual(l1: Location, l2: Location) {
        return l1.column == l2.column
            && l1.line == l2.line;
    }

    public column: number;
    public line: number;

    constructor(line: number, column: number) {
        this.line = line;
        this.column = column;
    }

    public Equals(other: Location) {
        return Location.AreEqual(this, other);
    }
}

export class Range {
    public static AreEqual(r1: Range, r2: Range) {
        return Location.AreEqual(r1.start, r2.start)
            && Location.AreEqual(r1.end, r2.end);
    }

    public start: Location;
    public end: Location;

    constructor(start: Location, end: Location) {
        this.start = start;
        this.end = end;
    }

    public Equals(other: Range) {
        return Range.AreEqual(this, other);
    }
}