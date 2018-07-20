import * as errors from '../structures/subtag.errors';
import * as util from '../util';

export { Engine, FatalError } from '../engine';
export { BBSubTag, BBString, ParseError } from '../language';
export { Context, Permission, RunMode } from '../structures/context';
export { SystemSubTag, SubTagError, SubTag } from '../structures/subtag';
export { errors, util };
export * from '../structures/subtag.conditions';

export function makeOperatorCollection<TAction extends Function>
    (...definitions: { names: string[], action: TAction }[]): { [key: string]: TAction } {
    let result = {} as { [key: string]: TAction };

    for (const definition of definitions) {
        for (const name of definition.names || []) {
            result[name] = definition.action;
        }
    }

    return result;
}