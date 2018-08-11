type variableValue = string | number | Array<string | number>;

export class Variable {
    public readonly name: string;
    private readonly original: variableValue;
    private _value: variableValue;

    constructor(name: string, value: variableValue) {
        this.name = name;
        this._value = this.original = value;
    }

    public get value() { return this._value; }
    public set value(value: variableValue) { this._value = value; }

    public get hasChanged() {
        return this._value !== this.original;
    }

    public reset() {
        this._value = this.original;
    }
}