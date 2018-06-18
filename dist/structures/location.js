"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = /** @class */ (function () {
    function Location(line, column) {
        this.line = line;
        this.column = column;
    }
    return Location;
}());
exports.Location = Location;
var Range = /** @class */ (function () {
    function Range(start, end) {
        this.start = start;
        this.end = end;
    }
    return Range;
}());
exports.Range = Range;
