import { TryGetResult, util } from '../util';
import { SubtagError } from './errors';
import { SubtagResult, SubtagResultPrimitive } from './subtagArguments';

export type StringExecutionResult = IFormattedStringResult | IUnformattedStringResult;
export type SubtagExecutionResult = ISubtagExecutionFailure | ISubtagExecutionSuccess;

export function createSubtagResult(value: string): SubtagStringResult;
export function createSubtagResult(value: boolean): SubtagBooleanResult;
export function createSubtagResult(value: number): SubtagNumberResult;
export function createSubtagResult(value: Array<string | number>): SubtagArrayResult;
export function createSubtagResult(value: SubtagError): SubtagErrorResult;
export function createSubtagResult(value: StringExecutionResult): SubtagExecutionResult;
export function createSubtagResult(value: SubtagResult): SubtagExecutionResult;
export function createSubtagResult(value: SubtagResult): SubtagExecutionResult {
    switch (typeof value) {
        case 'string': return new SubtagStringResult(value as string);
        case 'number': return new SubtagNumberResult(value as number);
        case 'boolean': return new SubtagBooleanResult(value as boolean);
        case 'object':
            if (value === undefined) { return new SubtagStringResult(''); }
            if (Array.isArray(value)) { return new SubtagArrayResult(value); }
            if (value instanceof SubtagError) { return new SubtagErrorResult(value); }
            if ('isFormatted' in (value as object)) { return new SubtagStringExecutionResult(value as StringExecutionResult); }
            break;
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
        return util.serialization.number.tryDeserialize(this.getString());
    }

    public tryGetBoolean(): TryGetResult<boolean> {
        return util.serialization.boolean.tryDeserialize(this.getString());
    }

    public tryGetArray(): TryGetResult<SubtagResultPrimitive[]> {
        return util.serialization.array.tryDeserialize(this.getString());
    }
}

abstract class SubtagSuccess<TRaw> extends ValueSource implements ISubtagExecutionSuccess {
    public readonly isSuccess: true = true;
    protected readonly _raw: TRaw;

    public constructor(raw: TRaw) {
        super();
        this._raw = raw;
    }

    public getRaw(): TRaw {
        return this._raw;
    }

    public getString(): string {
        return '' + this._raw;
    }
}

abstract class SubtagFailure<TRaw> extends ValueSource implements ISubtagExecutionFailure {
    public readonly isSuccess: false = false;
    protected readonly _raw: TRaw;

    public constructor(raw: TRaw) {
        super();
        this._raw = raw;
    }

    public getRaw(): TRaw {
        return this._raw;
    }

    public getString(): string {
        return '' + this._raw;
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.failure();
    }

    public tryGetBoolean(): TryGetResult<boolean> {
        return util.tryGet.failure();
    }

    public tryGetArray(): TryGetResult<SubtagResultPrimitive[]> {
        return util.tryGet.failure();
    }
}

abstract class StringResult extends ValueSource {
    protected readonly _format: string;
    protected readonly _results: SubtagExecutionResult[];

    public constructor(format: string, subtagResults: SubtagExecutionResult[]) {
        super();
        this._format = format;
        this._results = subtagResults;
    }

    public getString(): string {
        return util.format(this._format, this._results.map(r => r.getString()));
    }
}

class SubtagStringResult extends SubtagSuccess<string> {
    public constructor(value: string) {
        super(value);
    }

    public getString(): string { return this._raw; }
}

class SubtagNumberResult extends SubtagSuccess<number> {
    public constructor(value: number) {
        super(value);
    }

    public getString(): string {
        return util.serialization.number.serialize(this._raw);
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.success(this._raw);
    }

    public tryGetBoolean(): TryGetResult<boolean> {
        return util.tryGet.failure();
    }

    public tryGetArray(): TryGetResult<SubtagResultPrimitive[]> {
        return util.tryGet.failure();
    }
}

class SubtagBooleanResult extends SubtagSuccess<boolean> {
    public constructor(value: boolean) {
        super(value);
    }

    public getString(): string {
        return util.serialization.boolean.serialize(this._raw);
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.failure();
    }

    public tryGetBoolean(): TryGetResult<boolean> {
        return util.tryGet.success(this._raw);
    }

    public tryGetArray(): TryGetResult<Array<string | number>> {
        return util.tryGet.failure();
    }
}

class SubtagArrayResult extends SubtagSuccess<SubtagResultPrimitive[]> {
    public constructor(value: SubtagResultPrimitive[]) {
        super(value);
    }

    public getString(): string {
        return util.serialization.array.serialize(this._raw);
    }

    public tryGetNumber(): TryGetResult<number> {
        return util.tryGet.failure();
    }

    public tryGetBoolean(): TryGetResult<boolean> {
        return util.tryGet.failure();
    }

    public tryGetArray(): TryGetResult<SubtagResultPrimitive[]> {
        return util.tryGet.success(this._raw);
    }
}

class SubtagStringExecutionResult extends SubtagSuccess<StringExecutionResult> {
    public constructor(value: StringExecutionResult) {
        super(value);
    }

    public getString(): string {
        return this._raw.getString();
    }

    public tryGetNumber(): TryGetResult<number> {
        if (this._raw.isFormatted) {
            return this._raw.tryGetNumber();
        } else {
            return this._raw.subtagResult.tryGetNumber();
        }
    }

    public tryGetBoolean(): TryGetResult<boolean> {
        if (this._raw.isFormatted) {
            return this._raw.tryGetBoolean();
        } else {
            return this._raw.subtagResult.tryGetBoolean();
        }
    }

    public tryGetArray(): TryGetResult<SubtagResultPrimitive[]> {
        if (this._raw.isFormatted) {
            return this._raw.tryGetArray();
        } else {
            return this._raw.subtagResult.tryGetArray();
        }
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

    public tryGetArray(): TryGetResult<SubtagResultPrimitive[]> {
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
}

export interface ISubtagValueSource {
    getString(): string;
    tryGetArray(): TryGetResult<SubtagResultPrimitive[]>;
    tryGetNumber(): TryGetResult<number>;
    tryGetBoolean(): TryGetResult<boolean>;
}

export interface IFormattedStringResult extends ISubtagValueSource {
    readonly isFormatted: true;
}

export interface IUnformattedStringResult extends ISubtagValueSource {
    readonly isFormatted: false;
    readonly subtagResult: SubtagExecutionResult;
}

export interface ISubtagExecutionFailure extends ISubtagValueSource {
    readonly isSuccess: false;
    getRaw(): any;
}

export interface ISubtagExecutionSuccess extends ISubtagValueSource {
    readonly isSuccess: true;
    getRaw(): any;
}