import { BBSubTag, BBString } from '../language';
import { Context } from '../structures/context';
import { SubTagError } from './subtag';

const error = {
    custom(code: string, message: string): SubTagError {
        return async (subtag: BBSubTag | BBString, context: Context) => context.addError(code, subtag, message);
    },
    system: {
        missingSubtag() { return error.custom('BB-S-MS', `Missing subtag name`); },
        unknownSubtag(name: string) { return error.custom('BB-S-US', `Unknown subtag \`${name || '\u200b'}\``); },
        internalError() { return error.custom('BB-S-IS', `An internal server error has occurred`); }
    },
    arguments: {
        notEnough(minimum: number) { return error.custom('BB-A-NE', `Not enough arguments. Minimum ${minimum}`); },
        tooMany(maximum: number) { return error.custom('BB-A-TM', `Too many arguments. Maximum ${maximum}`); },
        outOfRange() { return error.custom('BB-A-OR', `Arguments out of range`); }
    },
    value: {
        notANumber(text: string) { return error.custom('BB-V-NU', `'${text}' is not a number`); },
        notAnArray(text: string) { return error.custom('BB-V-AR', `'${text}' is not an array`); },
        notABool(text: string) { return error.custom('BB-V-TF', `'${text}' is not a boolean`); }
    }
}

export = error;