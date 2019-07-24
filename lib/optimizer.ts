import { IStringToken, ISubtagToken } from './language';
import { OptimizationContext } from './structures';
import * as util from './util';

export function optimizeSubtagToken(input: ISubtagToken, context: OptimizationContext): ISubtagToken | string {
    const name = optimizeStringToken(input.name, context);
    input = { name, args: input.args, range: input.range };
    if (name.subtags.length === 0) {
        const optimiser = context.inner.subtags.find(name.format);
        if (optimiser !== undefined) {
            return optimiser.optimize(input, context);
        }
    }

    return {
        name,
        args: input.args.map(t => optimizeStringToken(t, context)),
        range: input.range
    };
}

export function optimizeStringToken(input: IStringToken, context: OptimizationContext): IStringToken {
    const replacements = [];
    const subtags = [];
    for (const subtag of input.subtags) {
        const optimized = optimizeSubtagToken(subtag, context);
        if (typeof optimized === 'string') {
            replacements.push(optimized);
        } else {
            replacements.push(`{${subtags.length}}`);
            subtags.push(optimized);
        }
    }

    return {
        range: input.range,
        format: util.format(input.format, replacements).trim(),
        subtags
    };
}