import util from '../util';
import { ISubtagToken } from './bbtag';
import { ExecutionContext } from './context';
import { IObject } from './subtagResults';

type SubtagValueType = 'string' | 'number' | 'array' | 'object' | 'raw';
export type SubtagArgumentDefinition = IHandlerArgumentGroup | IHandlerArgumentValue | IHandlerArgumentAutoResolveValue;
export type SubtagHandler<T extends ExecutionContext> = (args: SubtagArguments<T>) => Promise<SubtagValue> | SubtagValue;
export type SubtagValue = string | number | Array<number | string> | IObject | undefined | Error;

export class SubtagArgumentCollection<T extends ExecutionContext> {
    public add(definition: SubtagArgumentDefinition, handler: SubtagHandler<T>): this;
    public add(definition: SubtagArgumentDefinition[], handler: SubtagHandler<T>): this;
    public add(definition: SubtagArgumentDefinition | SubtagArgumentDefinition[], handler: SubtagHandler<T>): this {
        return this;
    }

    public default(handler: SubtagHandler<T>): this {
        return this;
    }

    public async execute(token: ISubtagToken, context: T): Promise<SubtagValue> {
        return undefined;
    }
}

export class SubtagArguments<T extends ExecutionContext> {

}

function _create(name: string, required: boolean, autoResolve: false): IHandlerArgumentValue;
function _create(name: string, required: boolean, autoResolve: true, autoResolveType: SubtagValueType | undefined): IHandlerArgumentAutoResolveValue;
function _create(name: string, required: boolean, autoResolve: boolean, autoResolveType?: SubtagValueType): any {
    return {
        name,
        required,
        autoResolve,
        autoResolveType
    };
}

function _require(name: string): IHandlerArgumentValue;
function _require(name: string, autoResolve: false): IHandlerArgumentValue;
function _require(name: string, autoResolve: true, autoResolveType?: SubtagValueType): IHandlerArgumentAutoResolveValue;
function _require(name: string, autoResolve: boolean = false, autoResolveType?: SubtagValueType): any {
    return _create(name, true, autoResolve as any, autoResolveType);
}

function _optional(name: string): IHandlerArgumentValue;
function _optional(name: string, autoResolve: false): IHandlerArgumentValue;
function _optional(name: string, autoResolve: true, autoResolveType?: SubtagValueType): IHandlerArgumentAutoResolveValue;
function _optional(name: string, autoResolve: boolean = false, autoResolveType?: SubtagValueType): any {
    return _create(name, false, autoResolve as any, autoResolveType);
}

function _group(values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
function _group(required: boolean, values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
function _group(required: boolean | SubtagArgumentDefinition[], values?: SubtagArgumentDefinition[]): IHandlerArgumentGroup {
    if (typeof required === 'boolean') {
        return { required, values: values! };
    }
    return { required: true, values: required };
}

function _argsToString(values: SubtagArgumentDefinition[]): string;
function _argsToString(...values: SubtagArgumentDefinition[]): string;
function _argsToString(...values: SubtagArgumentDefinition[] | [SubtagArgumentDefinition[]]): string {
    if (values.length === 1 && Array.isArray(values[0])) {
        values = values[0];
    }

    return _argsToStringRecursive(values as SubtagArgumentDefinition[]).trim();
}

function _argsToStringRecursive(values: SubtagArgumentDefinition[]): string {
    let result = '';

    for (const entry of values) {
        const brackets = entry.required ? ' <{0}>' : ' [{0}]';
        let content: string;
        switch (entry.autoResolve) {
            case undefined:
                content = _argsToStringRecursive(entry.values);
                break;
            case true:
                if (entry.autoResolveType !== undefined) {
                    content = `${entry.name}:${entry.autoResolveType}`;
                    break;
                }
            case false:
                content = entry.name;
                break;
        }
        result += util.format(brackets, content!);
    }

    return result;
}

export const args = {
    toString: _argsToString,
    create: _create,
    require: _require,
    optional: _optional,
    group: _group,
    r: _require,
    o: _optional,
    c: _create,
    g: _group
};

interface IHandlerArgumentValue {
    name: string;
    required: boolean;
    autoResolve: false;
}

interface IHandlerArgumentAutoResolveValue {
    name: string;
    required: boolean;
    autoResolve: true;
    autoResolveType?: SubtagValueType;
}

interface IHandlerArgumentGroup {
    required: boolean;
    values: SubtagArgumentDefinition[];
    autoResolve?: undefined;
}