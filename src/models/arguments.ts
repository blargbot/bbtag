import { default as util } from '../util';

export type SubtagArgumentDefinition = IHandlerArgumentGroup | IHandlerArgumentValue;

interface IHandlerArgumentValue {
    name: string;
    required: boolean;
    many: boolean;
    type?: string;
}

interface IHandlerArgumentGroup {
    required: boolean;
    values: SubtagArgumentDefinition[];
}

function _create(name: string, required: boolean): IHandlerArgumentValue;
function _create(name: string, required: boolean, many: boolean): IHandlerArgumentValue;
function _create(name: string, required: boolean, type: string): IHandlerArgumentValue;
function _create(name: string, required: boolean, many: boolean, type: string): IHandlerArgumentValue;
function _create(name: string, required: boolean, typeOrMany?: string | boolean, type?: string): IHandlerArgumentValue {
    if (typeof typeOrMany === 'string') {
        type = typeOrMany;
        typeOrMany = undefined;
    }

    const many = typeOrMany || false;

    return {
        name,
        required,
        many,
        type
    };
}

function _require(name: string): IHandlerArgumentValue;
function _require(name: string, many: boolean): IHandlerArgumentValue;
function _require(name: string, type: string): IHandlerArgumentValue;
function _require(name: string, many: boolean, type: string): IHandlerArgumentValue;
function _require(name: string, typeOrMany?: string | boolean, type?: string): IHandlerArgumentValue {
    return _create(name, true, typeOrMany as any, type!);
}

function _optional(name: string): IHandlerArgumentValue;
function _optional(name: string, many: boolean): IHandlerArgumentValue;
function _optional(name: string, type: string): IHandlerArgumentValue;
function _optional(name: string, many: boolean, type: string): IHandlerArgumentValue;
function _optional(name: string, typeOrMany?: string | boolean, type?: string): IHandlerArgumentValue {
    return _create(name, false, typeOrMany as any, type!);
}

function _group(...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
function _group(required: boolean, ...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
function _group(...values: any[]): IHandlerArgumentGroup {
    let required = false;
    if (typeof values[0] === 'boolean') {
        required = values[0];
        values.shift();
    }
    return { required, values };
}

function _argsToString(values: SubtagArgumentDefinition[]): string;
function _argsToString(...values: SubtagArgumentDefinition[]): string;
function _argsToString(...values: any[]): string {
    if (values.length === 1 && Array.isArray(values[0])) {
        values = values[0];
    }

    return _argsToStringRecursive(values).trim();
}

function _argsToStringRecursive(values: SubtagArgumentDefinition[]): string {
    let result = '';

    for (const entry of values) {
        const brackets = entry.required ? ' <{0}>' : ' [{0}]';
        const content = [];
        if ('name' in entry) {
            if (entry.many) {
                content.push('...');
            }
            content.push(entry.name);
            if (entry.type !== undefined) {
                content.push(':', entry.type);
            }
        } else {
            content.push(_argsToStringRecursive(entry.values));
        }
        result += util.format(brackets, content.join());
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