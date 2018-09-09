import { Engine } from './engine';
import { Converter } from './converter';
import { BBSubTag, BBString, ValidationError, BBStructure } from './structure';
import { Context } from './context';
import { errors } from './errors';
import { Enumerable } from '../structures/enumerable';

type BBArgs = Array<BBString | BBSubTag>;
type ReadyCheck = Promise<void> & { done: boolean };

export class ArgumentManager {
    private readonly argMap: Map<string, BBArgs>;

    public readonly ready: ReadyCheck;
    public readonly engine: Engine;
    public readonly converter: Converter;
    public readonly definitions: Enumerable<ArgumentDefinition>;
    public readonly subtag: BBSubTag;
    public readonly context: Context;

    constructor(engine: Engine, converter: Converter, definition: Iterable<ArgumentDefinition>, subtag: BBSubTag, context: Context) {
        this.engine = engine;
        this.converter = converter;
        this.subtag = subtag;
        this.context = context;
        this.argMap = new Map();
        this.definitions = Enumerable.from(definition);

        this.ready = mapArgs(this, this.argMap);
    }

    public getDefinition(name: string): ArgumentDefinition | undefined {
        return this.definitions.first(def => def.name == name) ||
            this.definitions.first(def => !!def.aliases && def.aliases.includes(name));
    }

    public hasArg(name: string): boolean {
        return this.argMap.has(name.toLowerCase());
    }

    public async getArg(name: string): Promise<BBString | BBSubTag> {
        let args = await this.getArgs(name);
        if (args.length === 1)
            return args[0];
        throw errors.argument.named.tooMany(this.context, this.subtag, name);
    }

    public async getArgs(name: string): Promise<Array<BBString | BBSubTag>> {
        if (!this.ready.done)
            await this.ready;
        let args = this.argMap.get(name.toLowerCase()) || [];
        if (args.length === 0)
            throw errors.argument.missing(this.context, this.subtag, name);
        return args;
    }

    public async getValue(name: string): Promise<any> {
        let arg = await this.getArg(name);
        return this.engine.execute(arg, this.context);
    }

    public async getValues(name: string): Promise<any[]> {
        let args = await this.getArgs(name);
        let result = [];
        // Promises must be handled in this manner rather than the recommended way
        // because we need to execute them in the order they are defined. They are
        // not guaranteed to be executable in parallel
        for (const arg of args)
            result.push(await this.engine.execute(arg, this.context));
        return result;
    }

    public async getString(name: string): Promise<string> {
        return this.converter.toString(await this.getValue(name));
    }

    public async getStrings(name: string): Promise<string[]> {
        let args = await this.getValues(name);
        return args.map(arg => this.converter.toString(arg));
    }

    public async getNumber(name: string): Promise<number> {
        return this.converter.toNumber(await this.getArg(name));
    }

    public async getNumbers(name: string): Promise<number[]> {
        let args = await this.getValues(name);
        return args.map(arg => this.converter.toNumber(arg));
    }
}

export type ArgumentDefinition = {
    name: string;
    aliases?: string[];
    type: string;
    desc: string;
    default?: BBString | BBSubTag;
    repeated?: boolean;
    dependsOn?: string;
};

class MappingResult {
    public map: Map<string, BBArgs>;
    public errors: ValidationError[];
    public get isErrored() { return this.errors.length > 0; }

    constructor(map: Map<string, BBArgs>, errors: ValidationError[]) {
        this.map = map;
        this.errors = errors;
    }
}

function mapArgs(manager: ArgumentManager, map: Map<string, BBArgs>): ReadyCheck {
    let result: ReadyCheck;

    result = new Promise(async (resolve, reject) => {
        try {
            await mapNamedArgs(manager, map);
            await mapPositionalArgs(manager, map);
            result.done = true;
            resolve();
        } catch (err) {
            map.clear();
            reject(err);
        }
    }) as ReadyCheck;

    return result;
}

async function mapNamedArgs(manager: ArgumentManager, map: Map<string, BBArgs>): Promise<void> {
    // Promises must be handled in this manner rather than the recommended way
    // because we need to execute them in the order they are defined. They are
    // not guaranteed to be executable in parallel
    for (const entry of manager.subtag.args.named) {
        let result = await manager.engine.execute(entry.name, manager.context);
        let name = manager.converter.toString(result)
            .substr(1); // remove preceeding *

        addToMap(map, name, ...entry.values);
    }
}

async function mapPositionalArgs(manager: ArgumentManager, map: Map<string, BBArgs>): Promise<void> {
    var result = mapPositionalArgFrom(manager, map, 0, 0);
    if (result.isErrored)
        throw result.errors;
}

function mapPositionalArgFrom(manager: ArgumentManager, map: Map<string, BBArgs>, argIndex: number, defIndex: number): MappingResult {
    var arg = manager.subtag.args.positional.get(argIndex)!;
    var def = manager.definitions.get(defIndex)!;

    if (arg === undefined && def === undefined) {
        return new MappingResult(map, [...validate(manager, map)]);
    }

    if (arg === undefined) { // Less arguments than definitions
        let remaining = manager.definitions.skip(defIndex);
        // If there are any remaining arguments that are logically required, throw error
        if (remaining.any(d => isRequired(d, map)))
            return new MappingResult(map, [new ValidationError(manager.subtag, 'Not enough arguments')]);
        return new MappingResult(map, [...validate(manager, map)]);
    }

    if (def === undefined) { // Less definitions than arguments
        return new MappingResult(map, [new ValidationError(manager.subtag, 'Too many arguments')]);
    }

    if (isRequired(def, map) && !isConditional(def, map)) { // Arg is required and not conditional
        addToMap(map, def, arg);
        let result = mapPositionalArgFrom(manager, map, argIndex + 1, defIndex + 1);
        if (result.isErrored)
            removeFromMap(map, def, arg);
        return result;
    } else { // Arg is optional or conditional
        addToMap(map, def, arg);
        let withArg = mapPositionalArgFrom(manager, map, argIndex + 1, defIndex + 1);
        if (!withArg.isErrored)
            return withArg;
        removeFromMap(map, def, arg);
        let withoutArg = mapPositionalArgFrom(manager, map, argIndex, defIndex + 1);
        if (withoutArg.isErrored)
            return withArg;
        return withoutArg;
    }
}

function* validate(manager: ArgumentManager, map: Map<string, BBArgs>): Iterable<ValidationError> {
    for (const definition of manager.definitions) {
        let values = getFromMap(map, definition);
        let supplied = values.length > 0;

        if (isConditional(definition, map)) {
            let isNegative = definition.dependsOn!.startsWith('!');
            let target = isNegative ? definition.dependsOn!.substring(1) : definition.dependsOn!;
            let targetValues = map.get(target);
            let failed = !targetValues || !targetValues.find(d => d.content !== '');
            if (failed === isNegative) {
                if (!supplied && isRequired(definition, map)) {
                    yield new ValidationError(manager.subtag,
                        `${definition.name} must be supplied when ${target} ${isNegative ? 'isnt' : 'is'}`
                    );
                }
            } else {
                if (supplied) {
                    yield new ValidationError(manager.subtag,
                        `${definition.name} cannot be supplied when ${target} ${isNegative ? 'is' : 'isnt'}`
                    );
                } else if (isRequired(definition, map)) {
                    yield requiredError(manager.subtag, definition.name);
                }
            }
        } else if (isRequired(definition, map)) {
            if (!supplied) {
                yield requiredError(manager.subtag, definition.name);
            }
        } else {
            if (!supplied) {
                addToMap(map, definition, definition.default!);
            }
        }

        if (!definition.repeated && values.length > 1) {
            yield new ValidationError(manager.subtag,
                `${definition.name} cannot accept multiple values`
            );
        }
    }
}

function requiredError(structure: BBStructure, name: string) {
    return new ValidationError(structure, `${name} is required`);
}

function isRequired(definition: ArgumentDefinition, map: Map<string, BBArgs>): boolean {
    // arg is optional or has already been provided
    if (definition.default !== undefined || (getFromMap(map, definition).length > 0)) return false;
    // arg is not conditionally required
    if (!isConditional(definition, map)) return true;
    // arg is conditionally required
    let parent = map.get(definition.dependsOn!);
    return !!parent && parent.length > 0;
}

function isConditional(def: ArgumentDefinition, map: Map<string, BBArgs>): boolean {
    return def.dependsOn !== undefined;
}

function getFromMap(map: Map<string, BBArgs>, definition: ArgumentDefinition) {
    return [...(function* () {
        for (const name of [definition.name, ...definition.aliases || []]) {
            let current = map.get(name.toLowerCase().trim());
            if (current)
                yield* current.filter(d => d.content !== '');
        }
    })()];
}

function addToMap(map: Map<string, BBArgs>, definition: ArgumentDefinition | string, ...values: BBArgs) {
    let name = typeof definition === 'string' ? definition : definition.name;
    let current = map.get(name);
    if (!current)
        map.set(name, current = []);

    current.push(...values);
    return map;
}

function removeFromMap(map: Map<string, BBArgs>, definition: ArgumentDefinition | string, ...values: BBArgs) {
    let name = typeof definition === 'string' ? definition : definition.name;
    let current = map.get(name);
    if (current) {
        let index;
        for (const entry of values) {
            index = current.indexOf(entry);
            if (index !== -1) {
                current.splice(index, 1);
            }
        }
    }

    return map;
}