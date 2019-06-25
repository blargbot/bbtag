import { TryGetResult, util } from '../util';
import { SubtagValue } from './subtagArguments';

export type StringExecutionResult = IFormattedStringResult | IUnformattedStringResult;
export type SubtagExecutionResult = ISubtagExecutionFailure | ISubtagExecutionSuccess;

export function createSubtagResult(value: string): SubtagStringResult;
export function createSubtagResult(value: number): SubtagNumberResult;
export function createSubtagResult(value: Array<string | number>): SubtagArrayResult;
export function createSubtagResult(value: IObject): SubtagObjectResult;
export function createSubtagResult(value: Error): SubtagErrorResult;
export function createSubtagResult(value: SubtagValue): SubtagExecutionResult;
export function createSubtagResult(value: SubtagValue): SubtagExecutionResult {
    switch (typeof value) {
        case 'string': return new SubtagStringResult(value as string);
        case 'number': return new SubtagNumberResult(value as number);
        case 'object':
            if (Array.isArray(value)) { return new SubtagArrayResult(value); }
            if (value instanceof Error) { return new SubtagErrorResult(value); }
            if (value === null) { return new SubtagStringResult(''); }
            return new SubtagObjectResult(value as IObject);
        case 'undefined':
            return new SubtagStringResult('');
    }
    throw new Error();
}

export function createStringResult(format: string, results: SubtagExecutionResult[]): StringExecutionResult {
    if (results.length === 1 && util.format(format, '') === '') {
        return new UnformattedStringResult(format, results[1]);
    }
    return new FormattedStringResult(format, results);
}

abstract class ValueSource implements ISubtagValueSource {
    public abstract getString(): string;

    public tryGetNumber(): TryGetResult<number> {
        return util.serialization.tryDeserializeNumber(this.getString());
    }

    public tryGetArray(): TryGetResult<Array<string | number>> {
        return util.serialization.tryDeserializeArray(this.getString());
    }

    public tryGetObject(): TryGetResult<IObject> {
        return util.serialization.tryDeserializeObject(this.getString());
    }
}

abstract class SubtagSuccess<TRaw> extends ValueSource implements ISubtagExecutionSuccess {
    public readonly isSuccess: true = true;
    protected readonly _raw: TRaw;

    constructor(raw: TRaw) {
        super();
        this._raw = raw;
    }

    public getRaw(): TRaw {
        return this._raw;
    }

    public toString(): string {
        return '' + this._raw;
    }
}

abstract class SubtagFailure<TRaw> implements ISubtagExecutionFailure {
    public readonly isSuccess: false = false;
    protected readonly _raw: TRaw;

    constructor(raw: TRaw) {
        this._raw = raw;
    }

    public getRaw(): TRaw {
        return this._raw;
    }

    public getString(): string {
        return '' + this._raw;
    }
}

abstract class StringResult extends ValueSource {
    protected readonly _format: string;
    protected readonly _results: SubtagExecutionResult[];

    constructor(format: string, subtagResults: SubtagExecutionResult[]) {
        super();
        this._format = format;
        this._results = subtagResults;
    }

    public getString(): string {
        return util.format(this._format, this._results);
    }
}

class SubtagStringResult extends SubtagSuccess<string> {
    constructor(value: string) {
        super(value);
    }

    public getString(): string { return this._raw; }
}

class SubtagNumberResult extends SubtagSuccess<number> {
    constructor(value: number) {
        super(value);
    }

    public getString(): string {
        return util.serialization.serializeNumber(this._raw);
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.success(this._raw);
    }

    public tryGetArray(): TryGetResult<Array<string | number>> {
        return util.tryGet.failure();
    }

    public tryGetObject(): TryGetResult<IObject> {
        return util.tryGet.failure();
    }
}

class SubtagArrayResult extends SubtagSuccess<Array<string | number>> {
    constructor(value: Array<string | number>) {
        super(value);
    }

    public getString(): string {
        return util.serialization.serializeArray(this._raw);
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.failure();
    }

    public tryGetArray(): TryGetResult<Array<string | number>> {
        return util.tryGet.success(this._raw);
    }

    public tryGetObject(): TryGetResult<IObject> {
        return util.tryGet.success(this._raw as IObject);
    }
}

class SubtagObjectResult extends SubtagSuccess<IObject> {

    constructor(value: IObject) {
        super(value);
    }

    public getString(): string {
        return util.serialization.serializeObject(this._raw);
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.failure();
    }

    public tryGetArray(): TryGetResult<Array<string | number>> {
        return util.tryGet.failure();
    }

    public tryGetObject(): TryGetResult<IObject> {
        return util.tryGet.success(this._raw);
    }
}

class SubtagErrorResult extends SubtagFailure<Error> {
    constructor(value: Error) {
        super(value);
    }

    public getString(): string {
        return `\`${this._raw.message}\``;
    }
}

class FormattedStringResult extends StringResult implements IFormattedStringResult {
    public readonly isFormatted: true = true;

    constructor(format: string, subtagResults: SubtagExecutionResult[]) {
        super(format, subtagResults);
    }
}

class UnformattedStringResult extends StringResult implements IUnformattedStringResult {
    public readonly isFormatted: false = false;
    public readonly subtagResult: SubtagExecutionResult;

    constructor(format: string, subtagResult: SubtagExecutionResult) {
        super(format, [subtagResult]);
        this.subtagResult = subtagResult;
    }

    public getString(): string {
        return this.subtagResult.getString();
    }

    public tryGetArray(): TryGetResult<Array<number | string>> {
        if (!this.subtagResult.isSuccess) {
            return util.tryGet.failure();
        }
        return this.subtagResult.tryGetArray();
    }

    public tryGetNumber(): TryGetResult<number> {
        if (!this.subtagResult.isSuccess) {
            return util.tryGet.failure();
        }
        return this.subtagResult.tryGetNumber();
    }

    public tryGetObject(): TryGetResult<IObject> {
        if (!this.subtagResult.isSuccess) {
            return util.tryGet.failure();
        }
        return this.subtagResult.tryGetObject();
    }
}

interface ISubtagStringSource {
    getString(): string;
}

interface ISubtagValueSource extends ISubtagStringSource {
    tryGetArray(): TryGetResult<Array<number | string>>;
    tryGetNumber(): TryGetResult<number>;
    tryGetObject(): TryGetResult<IObject>;
}

export interface IFormattedStringResult extends ISubtagValueSource {
    readonly isFormatted: true;
}

export interface IUnformattedStringResult extends ISubtagValueSource {
    readonly isFormatted: false;
    readonly subtagResult: SubtagExecutionResult;
}

export interface ISubtagExecutionFailure extends ISubtagStringSource {
    readonly isSuccess: false;
    getRaw(): any;
}

export interface ISubtagExecutionSuccess extends ISubtagValueSource {
    readonly isSuccess: true;
    getRaw(): any;
}

export interface IObject {
    [key: string]: any;
}