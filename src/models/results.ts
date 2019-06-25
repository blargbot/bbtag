import { ITryGetFailure, ITryGetSuccess, TryGetResult, util } from '../util';
import { IStringToken } from './bbtag';

export type StringExecutionResult = IFormattedStringResult | IUnformattedStringResult;
export type SubtagExecutionResult = ISubtagExecutionFailure | ISubtagExecutionSuccess;

export function createSubtagResult(value: string): SubtagStringResult;
export function createSubtagResult(value: number): SubtagNumberResult;
export function createSubtagResult(value: any[]): SubtagArrayResult;
export function createSubtagResult(value: IObject): SubtagObjectResult;
export function createSubtagResult(value: Error): SubtagErrorResult;
export function createSubtagResult(value: any): SubtagExecutionResult {
    switch (typeof value) {
        case 'string': return new SubtagStringResult(value);
        case 'number': return new SubtagNumberResult(value);
        case 'object':
            if (Array.isArray(value)) { return new SubtagArrayResult(value); }
            if (value instanceof Error) { return new SubtagErrorResult(value); }
            return new SubtagObjectResult(value);
        default:
            throw new Error(`Subtag result cannot handle a result of type '${typeof value}'`);
    }
}

export function createStringResult(format: string, results: SubtagExecutionResult[]): StringExecutionResult {
    if (results.length === 1 && util.format(format, '') === '') {
        return new UnformattedStringResult(format, results[1]);
    }
    return new FormattedStringResult(format, results);
}

abstract class SubtagSuccess<TRaw> implements ISubtagExecutionSuccess {
    public readonly isSuccess: true = true;

    public abstract getRaw: () => TRaw;
    public abstract getString: () => string;
    public abstract tryGetArray: () => TryGetResult<any[]>;
    public abstract tryGetNumber: () => TryGetResult<number>;
    public abstract tryGetObject: () => TryGetResult<IObject>;
}

abstract class SubtagFailure implements ISubtagExecutionFailure {
    public readonly isSuccess: false = false;
    public abstract getString: () => string;
}

class SubtagStringResult extends SubtagSuccess<string> {
    public readonly getRaw: () => string;
    public readonly getString: () => string;
    public readonly tryGetArray: () => TryGetResult<any[]>;
    public readonly tryGetNumber: () => TryGetResult<number>;
    public readonly tryGetObject: () => TryGetResult<IObject>;

    constructor(value: string) {
        super();
        this.getRaw = () => value;
        this.getString = () => value;
        this.tryGetNumber = () => util.serialization.tryDeserializeNumber(value);
        this.tryGetArray = () => util.serialization.tryDeserializeArray(value);
        this.tryGetObject = () => util.serialization.tryDeserializeObject(value);
    }

}

class SubtagNumberResult extends SubtagSuccess<number> {
    public readonly getRaw: () => number;
    public readonly getString: () => string;
    public readonly tryGetNumber: () => ITryGetSuccess<number>;
    public readonly tryGetArray: () => ITryGetFailure;
    public readonly tryGetObject: () => ITryGetFailure;

    constructor(value: number) {
        super();
        this.getRaw = () => value;
        this.getString = () => util.serialization.serializeNumber(value);
        this.tryGetNumber = () => util.tryGet.success(value);
        this.tryGetArray = util.tryGet.failure;
        this.tryGetObject = util.tryGet.failure;
    }
}

class SubtagArrayResult extends SubtagSuccess<any[]> {
    public readonly getRaw: () => any[];
    public readonly getString: () => string;
    public readonly tryGetNumber: () => ITryGetFailure;
    public readonly tryGetArray: () => ITryGetSuccess<any[]>;
    public readonly tryGetObject: () => ITryGetSuccess<IObject>;

    constructor(value: any[]) {
        super();
        this.getRaw = () => value;
        this.getString = () => util.serialization.serializeArray(value);
        this.tryGetNumber = util.tryGet.failure;
        this.tryGetArray = () => util.tryGet.success(value);
        this.tryGetObject = () => util.tryGet.success(value as IObject);
    }
}

class SubtagObjectResult extends SubtagSuccess<IObject> {
    public readonly getRaw: () => IObject;
    public readonly getString: () => string;
    public readonly tryGetNumber: () => ITryGetFailure;
    public readonly tryGetArray: () => ITryGetFailure;
    public readonly tryGetObject: () => ITryGetSuccess<IObject>;

    constructor(value: IObject) {
        super();
        this.getRaw = () => value;
        this.getString = () => { throw new Error('Method not implemented'); };
        this.tryGetNumber = util.tryGet.failure;
        this.tryGetArray = util.tryGet.failure;
        this.tryGetObject = () => util.tryGet.success(value);
    }
}

class SubtagErrorResult extends SubtagFailure {
    public readonly getError: () => Error;
    public readonly getString: () => string;

    constructor(value: Error) {
        super();

        this.getString = () => `\`${value.message}\``;
        this.getError = () => value;
    }
}

class FormattedStringResult implements IFormattedStringResult {
    public readonly isFormatted: true = true;
    public readonly getString: () => string;

    constructor(format: string, subtagResults: SubtagExecutionResult[]) {
        this.getString = () => util.format(format, subtagResults.map(r => r.getString()));
    }
}

class UnformattedStringResult implements IUnformattedStringResult {
    public readonly isFormatted: false = false;
    public readonly subtagResult: SubtagExecutionResult;
    public readonly getString: () => string;

    constructor(format: string, subtagResult: SubtagExecutionResult) {
        this.getString = () => util.format(format, subtagResult);
        this.subtagResult = subtagResult;
    }
}

export interface IFormattedStringResult {
    isFormatted: true;
    getString(): string;
}

export interface IUnformattedStringResult {
    isFormatted: false;
    subtagResult: SubtagExecutionResult;
    getString(): string;
}

export interface IObject {
    [key: string]: any;
}

export interface ISubtagExecutionFailure {
    readonly isSuccess: false;
    getString(): string;
}

export interface ISubtagExecutionSuccess {
    readonly isSuccess: true;
    getRaw(): any;
    getString(): string;
    tryGetArray(): TryGetResult<any[]>;
    tryGetNumber(): TryGetResult<number>;
    tryGetObject(): TryGetResult<IObject>;
}