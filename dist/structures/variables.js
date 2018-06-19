"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class VariableManager {
    constructor(context, engine) {
        this._map = {};
        this._engine = engine;
        this.context = context;
    }
    getVariable(name) {
        let force = name.startsWith('!');
        if (force || !this._map.hasOwnProperty(name)) {
            if (force)
                name = name.substr(1);
            let current = this._engine.database.variables.get(this.context, name);
            this._map[name] = current.then(value => new Variable(value));
        }
        return this._map[name];
    }
    getValue(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getVariable(name)).value;
        });
    }
    setValue(name, value) {
        return __awaiter(this, void 0, void 0, function* () {
            (yield this.getVariable(name)).value = value;
        });
    }
    persist() {
        return __awaiter(this, void 0, void 0, function* () {
            let promises = Object.keys(this._map).map((key) => __awaiter(this, void 0, void 0, function* () {
                return {
                    key,
                    value: yield this._map[key]
                };
            }));
            let entries = yield Promise.all(promises);
            let update = entries.filter(entry => entry.value.hasChanged).map(entry => {
                return {
                    name: entry.key,
                    value: entry.value.value
                };
            });
            yield this._engine.database.variables.set(this.context, update);
        });
    }
}
exports.VariableManager = VariableManager;
class Variable {
    get initial() { return this._initial; }
    get hasChanged() { return this.initial != this.value; }
    constructor(value) {
        this._initial = this.value = value;
    }
}
exports.Variable = Variable;
