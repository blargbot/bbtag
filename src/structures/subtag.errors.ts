import { BBSubTag, BBString } from '../language';
import { Context } from '../structures/context';
import { SubTagError } from './subtag';
import { smartJoin } from '../util/generic';

export function custom(code: string, message: string): SubTagError {
    return async (subtag: BBSubTag | BBString, context: Context) => context.addError(code, subtag, message);
}

export const system = {
    missingSubtag() { return custom('BB-S-MS', `Missing subtag name`); },
    unknownSubtag(name: string) { return custom('BB-S-US', `Unknown subtag '${name || '\u200b'}'`); },
    internalError() { return custom('BB-S-IS', `An internal server error has occurred`); }
}

export const args = {
    notEnough(minimum: number) { return custom('BB-A-NE', `Not enough arguments. Minimum ${minimum}`); },
    tooMany(maximum: number) { return custom('BB-A-TM', `Too many arguments. Maximum ${maximum}`); },
    outOfRange() { return custom('BB-A-OR', `Arguments out of range`); }
}

export const value = {
    expected(expected: string[], actual: string[]) {
        return custom('BB-V-UV', `expected '${
            smartJoin(expected, '\', \'', '\' or \'')
            }' but got '${
            smartJoin(actual, '\', \'', '\' and \'')
            }'`);
    },
    notANumber(text: string) { return custom('BB-V-NU', `'${text}' is not a number`); },
    notAnArray(text: string) { return custom('BB-V-AR', `'${text}' is not an array`); },
    notABool(text: string) { return custom('BB-V-TF', `'${text}' is not a boolean`); }
}