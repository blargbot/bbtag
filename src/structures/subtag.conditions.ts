import { BBSubTag } from '../language';
import { SubTag, RawArguments } from './subtag';
import { array } from '../util';

export type Condition = (subtag: BBSubTag, rawArgs: RawArguments) => boolean | Promise<boolean>;
export interface SubTagCondition extends Condition {
    or(...conditions: Condition[]): SubTagCondition;
    and(...conditions: Condition[]): SubTagCondition;
}

export function makeChainable(condition: Condition): SubTagCondition {
    let result = <SubTagCondition>condition;
    result.or = (...conditions: Condition[]) => satisfiesAny(result, ...conditions);
    result.and = (...conditions: Condition[]) => satisfiesAll(result, ...conditions);

    return result;
}

export function satisfies(condition: Condition): SubTagCondition {
    return makeChainable(condition);
}

export function satisfiesAny(...conditions: Condition[]): SubTagCondition {
    return satisfies(async function (subtag: BBSubTag, rawArgs: RawArguments) {
        for (const c of conditions)
            if (await c(subtag, rawArgs))
                return true;
        return false;
    });
}

export function satisfiesAll(...conditions: Condition[]): SubTagCondition {
    return satisfies(async function (subtag: BBSubTag, rawArgs: RawArguments) {
        for (const c of conditions)
            if (!await c(subtag, rawArgs))
                return false;
        return true;
    });
}

export function hasCounts(...count: Array<string | number>): SubTagCondition {
    return satisfiesAny(...count.map(hasCount));
}

export function hasCount(count: string | number): SubTagCondition {
    if (typeof count === 'number')
        return satisfies(s => s.args.length === count);
    let match: string[] | null = count.match(/^(\d+)$/);
    if (match) {
        count = parseInt(match[1]);
        return satisfies(s => s.args.length === count);
    }

    match = count.match(/^(<=|>=|<|>|==|=|!=|!)(\d+)$/);
    if (match) {
        count = parseInt(match[2]);
        switch (match[1]) {
            case '<=': return satisfies(s => s.args.length <= count);
            case '>=': return satisfies(s => s.args.length >= count);
            case '>': return satisfies(s => s.args.length > count);
            case '<': return satisfies(s => s.args.length < count);
            case '==':
            case '=': return satisfies(s => s.args.length === count);
            case '!=':
            case '!': return satisfies(s => s.args.length !== count);
            default: return satisfies(() => false);
        }
    }

    match = count.match(/^(\d+)-(\d+)$/);
    if (match) {
        let from = parseInt(match[1]);
        let to = parseInt(match[2]);
        [from, to] = [Math.min(from, to), Math.max(from, to)];
        return satisfies(s => s.args.length >= from && s.args.length <= to);
    }

    return satisfies(() => false);
}

export function hasArgs(args: string[]) {
    return satisfies(async (_, rawArgs) => {
        return array.all(args, arg => arg in rawArgs)
    });
}