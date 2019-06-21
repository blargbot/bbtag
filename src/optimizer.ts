import { SubtagToken, OptimizationContext, StringToken } from './models';

export function optimizeSubtagToken(subtag: SubtagToken, context: OptimizationContext): SubtagToken | string {
    let name = optimizeStringToken(subtag.name, context);
    subtag = { ...subtag, name };
    if (name.subtags.length != 0) {
        return subtag;
    }

    let optimiser = context.findSubtag(name.format);
    if (optimiser === undefined) {
        return subtag;
    }

    return optimiser.optimize(subtag, context);
}

export function optimizeStringToken(string: StringToken, context: OptimizationContext): StringToken {
    let replacements = [];
    let subtags = [];
    for (const subtag of string.subtags) {
        let optimized = optimizeSubtagToken(subtag, context);
        if (typeof optimized === 'string') {
            replacements.push(optimized);
        } else {
            replacements.push(`{${subtags.length}}`);
            subtags.push(optimized);
        }
    }

    return {
        range: string.range,
        format: string.format.format(replacements).trim(),
        subtags: subtags
    };
}