import { format } from '../util';

export type SubtagArgumentDefinition = IHandlerArgumentGroup | IHandlerArgumentValue;

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

function _create(name: string, required: boolean): IHandlerArgumentValue;
function _create(name: string, required: boolean, many: boolean): IHandlerArgumentValue;
function _create(name: string, required: boolean, type: string): IHandlerArgumentValue;
function _create(name: string, required: boolean, many: boolean, type: string): IHandlerArgumentValue;
function _create(name: string, required: boolean, ...args: [boolean, string] | [string | boolean]): IHandlerArgumentValue {
    const [many, type] = typeof args[0] === 'boolean' ? [args[0], args[1]] : [false, args[0]];
    return { name, required, many, type };
}

function _require(name: string): IHandlerArgumentValue;
function _require(name: string, many: boolean): IHandlerArgumentValue;
function _require(name: string, type: string): IHandlerArgumentValue;
function _require(name: string, many: boolean, type: string): IHandlerArgumentValue;
function _require(name: string, ...args: [boolean, string] | [string | boolean]): IHandlerArgumentValue {
    return _create(...[name, true, ...args] as Parameters<typeof _create>);
}

function _optional(name: string): IHandlerArgumentValue;
function _optional(name: string, many: boolean): IHandlerArgumentValue;
function _optional(name: string, type: string): IHandlerArgumentValue;
function _optional(name: string, many: boolean, type: string): IHandlerArgumentValue;
function _optional(name: string, ...args: [boolean, string] | [string | boolean]): IHandlerArgumentValue {
    return _create(...[name, false, ...args] as Parameters<typeof _create>);
}

function _group(...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
function _group(required: boolean, ...values: SubtagArgumentDefinition[]): IHandlerArgumentGroup;
function _group(...args: [boolean, ...SubtagArgumentDefinition[]] | SubtagArgumentDefinition[]): IHandlerArgumentGroup {
    const [required, values] = typeof args[0] === 'boolean' ? [args[0], args.slice(1) as SubtagArgumentDefinition[]] : [false, args as SubtagArgumentDefinition[]];
    return { required, values };
}

function _stringify(separator: string, values: SubtagArgumentDefinition[]): string {
    const result = [];

    for (const entry of values) {
        const brackets = entry.required ? '<{0}>' : '[{0}]';
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
            content.push(_stringify(separator, entry.values));
        }
        result.push(format(brackets, content.join('')));
    }

    return result.join(separator).trim();
}

export const argumentBuilder = {
    create: _create,
    c: _create,
    require: _require,
    r: _require,
    optional: _optional,
    o: _optional,
    group: _group,
    g: _group,
    stringify: _stringify
};

export default argumentBuilder;