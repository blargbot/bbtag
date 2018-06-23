import { BBSubTag, BBString } from '../language';
import { Context } from '../structures/context';
import { SubTagError } from './subtag';

const error = {
    custom: function <TContext extends Context>(code: string, message: string): SubTagError {
        return async (subtag: BBSubTag | BBString, context: Context) => context.addError(code, subtag, message);
    },
    arguments: {
        notEnough: (minimum: number) => error.custom('BB-A-NE', `Not enough arguments. Minimum ${minimum}`),
        tooMany: (maximum: number) => error.custom('BB-A-TM', `Too many arguments. Maximum ${maximum}`),
        outOfRange: () => error.custom('BB-A-OR', `Arguments out of range`),

    },
    value: {
        notANumber: (text: string) => error.custom('BB-V-NU', `'${text}' is not a number`),
        notAnArray: (text: string) => error.custom('BB-V-AR', `'${text}' is not an array`),
        notABool: (text: string) => error.custom('BB-V-TF', `'${text}' is not a boolean`)
    }
}

export = error;