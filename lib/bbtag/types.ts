import { TokenRange, Try } from '../util';

export type SubtagPrimitiveResult = null | undefined | void | string | number | boolean;
export type SubtagResult = SubtagPrimitiveResult | SubtagResultArray | ISubtagError;
export type SubtagResultArray = SubtagPrimitiveResult[] & { name?: string };
export type SubtagResultType = keyof SubtagResultTypeMap;
export type SwitchHandlers<T> = { [K in keyof SubtagResultTypeMap]?: (value: SubtagResultTypeMap[K]) => T };
export type SubtagConditionFunc = (args: readonly IStringToken[]) => boolean;
export type SubtagCondition = SubtagConditionFunc | string | number;
export type ErrorFunc<T extends any[] = []> = ErrorFuncOverload1<T> & ErrorFuncOverload2<T> & ErrorFuncOverload3<T>;
export type ErrorParams<T extends any[] = []> = Parameters<ErrorFuncOverload1<T> | ErrorFuncOverload2<T> | ErrorFuncOverload3<T>>;

type TokenType = ISubtagToken | IStringToken;
type ErrorFuncOverload1<T extends any[] = []> = ((args: { context: ISubtagErrorContext, token: TokenType }, ...remainder: T) => ISubtagError);
type ErrorFuncOverload2<T extends any[] = []> = ((args: { context: ISubtagErrorContext, token?: TokenType }, token: TokenType, ...remainder: T) => ISubtagError);
type ErrorFuncOverload3<T extends any[] = []> = ((context: ISubtagErrorContext, token: TokenType, ...remainder: T) => ISubtagError);

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
