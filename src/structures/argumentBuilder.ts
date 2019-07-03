import { default as util } from '../util';

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

export interface IArgumentSource {
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

    stringify(values: SubtagArgumentDefinition[]): string;
    stringify(...values: SubtagArgumentDefinition[]): string;
}

export const argumentBuilder: IArgumentSource = {
    r: undefined!,
    require(name: string, typeOrMany?: string | boolean, type?: string): IHandlerArgumentValue {
        return this.create(name, true, typeOrMany as any, type!);
    },

    o: undefined!,
    optional(name: string, typeOrMany?: string | boolean, type?: string): IHandlerArgumentValue {
        return this.create(name, false, typeOrMany as any, type!);
    },

    g: undefined!,
    group(...values: any[]): IHandlerArgumentGroup {
        let required = false;
        if (typeof values[0] === 'boolean') {
            required = values[0];
            values.shift();
        }
        return { required, values };
    },

    c: undefined!,
    create(name: string, required: boolean, typeOrMany?: string | boolean, type?: string): IHandlerArgumentValue {
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
    },

    stringify(...values: any[]): string {
        if (values.length === 1 && Array.isArray(values[0])) {
            values = values[0];
        }

        return _argsToStringRecursive(values).trim();
    }
};

argumentBuilder.r = argumentBuilder.require;
argumentBuilder.o = argumentBuilder.optional;
argumentBuilder.g = argumentBuilder.group;
argumentBuilder.c = argumentBuilder.create;

function _argsToStringRecursive(values: SubtagArgumentDefinition[]): string {
    let result = '';

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
            content.push(_argsToStringRecursive(entry.values));
        }
        result += util.format(brackets, content.join(''));
    }

    return result;
}