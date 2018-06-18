"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseTag = /** @class */ (function () {
    function BaseTag(context, parent, range) {
        this._context = context;
        this.parent = parent;
        this.range = range;
    }
    Object.defineProperty(BaseTag.prototype, "source", {
        get: function () { return this._context.source; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseTag.prototype, "start", {
        get: function () { return this.range.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseTag.prototype, "end", {
        get: function () { return this.range.end; },
        enumerable: true,
        configurable: true
    });
    return BaseTag;
}());
exports.default = BaseTag;
