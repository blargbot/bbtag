import { TokenRange, Try } from '../util';
import errors from './errors';

export type SubtagPrimitiveResult = null | undefined | void | string | number | boolean;
export type SubtagResult = SubtagPrimitiveResult | SubtagResultArray | ISubtagError;
export type SubtagResultArray = SubtagPrimitiveResult[] & { name?: string };
export type SubtagResultType = keyof SubtagResultTypeMap;
export type SwitchHandlers<T> = { [K in keyof SubtagResultTypeMap]?: (value: SubtagResultTypeMap[K]) => T };
export type SubtagConditionFunc = (args: readonly IStringToken[]) => boolean;
export type SubtagCondition = SubtagConditionFunc | string | number;
export type ErrorFunc<T extends any[] = [], R = ISubtagError> = ErrorFuncOverload1<T, R> & ErrorFuncOverload2<T, R> & ErrorFuncOverload3<T, R>;
export type ErrorParams<T extends any[] = []> = Parameters<ErrorFuncOverload1<T> | ErrorFuncOverload2<T> | ErrorFuncOverload3<T>>;
export type SubtagArgumentDefinition = IHandlerArgumentGroup | IHandlerArgumentValue;
export type IBBTagTypeChecker = { [K in keyof SubtagResultTypeMap]: (target: SubtagResult) => target is SubtagResultTypeMap[K] };

type TokenType = ISubtagToken | IStringToken;
type ErrorFuncOverload1<T extends any[] = [], R = ISubtagError> = ((args: { context: ISubtagErrorContext, token: TokenType }, ...remainder: T) => R);
type ErrorFuncOverload2<T extends any[] = [], R = ISubtagError> = ((args: { context: ISubtagErrorContext, token?: TokenType }, token: TokenType, ...remainder: T) => R);
type ErrorFuncOverload3<T extends any[] = [], R = ISubtagError> = ((context: ISubtagErrorContext, token: TokenType, ...remainder: T) => R);

// tslint:disable-next-line: interface-over-type-literal
export type SubtagResultTypeMap = {
    string: string,
    number: number,
    boolean: boolean,
    null: null | undefined | void,
    array: SubtagResultArray,
    error: ISubtagError
};

export interface IBBTag {
    source: string;
    root: IStringToken;
}

export interface IStringToken {
    readonly format: string;
    readonly subtags: readonly ISubtagToken[];
    readonly range: TokenRange;
}

export interface ISubtagToken {
    readonly name: IStringToken;
    readonly args: readonly IStringToken[];
    readonly range: TokenRange;
}

export interface ISubtagError {
    readonly message: string;
    readonly token: IStringToken | ISubtagToken;
    readonly context: ISubtagErrorContext;
}
export interface ISubtagErrorContext {
    fallback: SubtagResult;
    error(token: IStringToken | ISubtagToken, message: string): ISubtagError;
}

export interface IHandlerArgumentValue {
    name: string;
    required: boolean;
    many: boolean;
    type?: string;
}

export interface IHandlerArgumentGroup {
    required: boolean;
    values: SubtagArgumentDefinition[];
}

export interface ISerializer<T> {
    serialize(this: void, value: T): string;
    deserialize(this: void, value: string): T;
    tryDeserialize(this: void, value: string): Try.Result<T>;
}

export interface ISubtagResultCollection {
    startsWith(target: SubtagResult): boolean;
    endsWith(target: SubtagResult): boolean;
    includes(target: SubtagResult): boolean;
}

export interface ISubtagConditionPattern {
    regex: RegExp;
    parse: (match: RegExpExecArray) => SubtagConditionFunc;
}

export interface IBBTagUtilities {
    readonly args: IBBTagArgumentBuilder;
    readonly check: IBBTagTypeChecker;
    readonly conditions: IBBTagConditionParser;
    readonly convert: IBBTagTypeConverter;
    readonly errors: typeof errors;
    compare(left: SubtagResult, right: SubtagResult): -1 | 0 | 1;
    getType(target: SubtagResult): keyof SubtagResultTypeMap;
    parse(source: string): IStringToken;
    switchType<T>(target: SubtagResult, handlers: Required<SwitchHandlers<T>>): T;
    switchType<T>(target: SubtagResult, handlers: SwitchHandlers<T>): T | undefined;
    switchType<T, R = T>(target: SubtagResult, handlers: SwitchHandlers<T>, defaultCase: (value: SubtagResult) => R): T | R;
}

export interface IBBTagArgumentBuilder {
    create(name: string, required: boolean): IHandlerArgumentValue;
    create(name: string, required: boolean, many: boolean): IHandlerArgumentValue;
    create(name: string, required: boolean, type: string): IHandlerArgumentValue;
    create(name: string, required: boolean, many: boolean, type: string): IHandlerArgumentValue;
    c(name: string, required: boolean): IHandlerArgumentValue;
    c(name: string, required: boolean, many: boolean): IHandlerArgumentValue;
    c(name: string, required: boolean, type: string): IHandlerArgumentValue;
    c(name: string, required: boolean, many: boolean, type: string): IHandlerArgumentValue;
    require(name: string): IHandlerArgumentValue;
    require(name: string, many: boolean): IHandlerArgumentValue;
    require(name: string, type: string): IHandlerArgumentValue;
    require(name: string, many: boolean, type: string): IHandlerArgumentValue;
    r(name: string): IHandlerArgumentValue;
    r(name: string, many: boolean): IHandlerArgumentValue;
    r(name: string, type: string): IHandlerArgumentValue;
    r(name: string, many: boolean, type: string): IHandlerArgumentValue;
    optional(name: string): IHandlerArgumentValue;
    optional(name: string, many: boolean): IHandlerArgumentValue;
    optional(name: string, type: string): IHandlerArgumentValue;
    optional(name: string, many: boolean, type: string): IHandlerArgumentValue;
    o(name: string): IHandlerArgumentValue;
    o(name: string, many: boolean): IHandlerArgumentValue;
    o(name: string, type: string): IHandlerArgumentValue;
    o(name: string, many: boolean, type: string): IHandlerArgumentValue;
    group(...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
    group(required: boolean, ...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
    g(...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
    g(required: boolean, ...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
    stringify(separator: string, values: SubtagArgumentDefinition[]): string;
}

export interface IBBTagConditionParser {
    readonly patterns: ISubtagConditionPattern[];
    parse(condition: string): SubtagConditionFunc;
}

export interface IBBTagTypeConverter {
    toString(source: SubtagResult): string;
    toPrimitive(source: SubtagResult): SubtagPrimitiveResult;
    toBoolean(source: SubtagResult, defaultValue?: boolean | ((value: SubtagResult) => boolean)): boolean;
    toNumber(source: SubtagResult, defaultValue?: number | ((value: SubtagResult) => number)): number;
    toArray(source: SubtagResult, defaultValue?: SubtagResultArray | ((value: SubtagResult) => SubtagResultArray)): SubtagResultArray;
    tryToBoolean(source: SubtagResult): Try.Result<boolean>;
    tryToNumber(source: SubtagResult): Try.Result<number>;
    tryToArray(source: SubtagResult): Try.Result<SubtagResultArray>;
    toCollection(target: SubtagResult): ISubtagResultCollection;
}