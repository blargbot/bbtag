import { BBSubTag, BBString } from '../language';
import { Context } from '../structures/context';
import { SubTagErrorFunc } from './subtag';

const error = {
    custom: function <TContext extends Context>(code: string, message: string): SubTagErrorFunc<TContext> {
        return (subtag: BBSubTag | BBString, context: TContext) =>
            Promise.resolve(context.addError(code, subtag, message));
    },
    arguments: {
        notEnough: (minimum: number) => error.custom('BB-A-NE', `Not enough arguments. Minimum ${minimum}`),
        tooMany: (maximum: number) => error.custom('BB-A-TM', `Too many arguments. Maximum ${maximum}`),
        outOfRange: () => error.custom('BB-A-OR', `Arguments out of range`),

    }
}

export = error;