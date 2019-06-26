import util from '../util';
import { ISubtagToken } from './bbtag';
import { ExecutionContext } from './context';
import { IObject } from './subtagResults';

export type SubtagArgumentDefinition = IHandlerArgumentGroup | IHandlerArgumentValue;
export type SubtagValue = string | number | Array<number | string> | Error | IObject | undefined;

function _create(name: string, required: boolean): IHandlerArgumentValue;
function _create(name: string, required: boolean, type: string): IHandlerArgumentValue;
function _create(name: string, required: boolean, type?: string): IHandlerArgumentValue {
    return {
        name,
        required,
        type
    };
}

function _require(name: string): IHandlerArgumentValue;
function _require(name: string, type: string): IHandlerArgumentValue;
function _require(name: string, type?: string): any {
    return _create(name, true, type!);
}

function _optional(name: string): IHandlerArgumentValue;
function _optional(name: string, type: string): IHandlerArgumentValue;
function _optional(name: string, type?: string): any {
    return _create(name, false, type!);
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
        if ('name' in entry) {
            content = entry.name;
            if (entry.type !== undefined) {
                content += ':' + entry.type;
            }
        } else {
            content = _argsToStringRecursive(entry.values);
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
    type?: string;
}

interface IHandlerArgumentGroup {
    required: boolean;
    values: SubtagArgumentDefinition[];
}