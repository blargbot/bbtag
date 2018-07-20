import { Engine, hasCount, hasArgs, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';
import { makeOperatorCollection } from '../../util';
import { SubTagHandler, SubTag, RawArguments } from '../../../structures/subtag';
import { Operator } from './operator';

export type comparer = (a: string, b: string) => boolean;

export class Bool extends SystemSubTag {
    public static readonly operators = makeOperatorCollection<comparer>(
        { names: ['==', '=', 'eq'], action: (a, b) => util.Comparer.Default.areEqual(a, b) },
        { names: ['!=', '!', 'ne'], action: (a, b) => util.Comparer.Default.notEqual(a, b) },
        { names: ['>', 'gt'], action: (a, b) => util.Comparer.Default.greaterThan(a, b) },
        { names: ['<', 'lt'], action: (a, b) => util.Comparer.Default.lessThan(a, b) },
        { names: ['>=', 'ge'], action: (a, b) => util.Comparer.Default.greaterOrEqual(a, b) },
        { names: ['<=', 'le'], action: (a, b) => util.Comparer.Default.lessOrEqual(a, b) },
        { names: ['startswith', 'sw'], action: (a, b) => util.Comparer.Default.startsWith(a, b) },
        { names: ['endswith', 'ew'], action: (a, b) => util.Comparer.Default.endsWith(a, b) },
        { names: ['includes', 'inc'], action: (a, b) => util.Comparer.Default.includes(a, b) },
    );

    private makeHandler(operator: string): SubTagHandler<Context> {
        let valid = hasCount('1-2');
        let notEnough = hasCount('0');
        let tooMany = hasCount('>2');
        return async (subtag: BBSubTag, context: Context, rawArgs: RawArguments) => {
            if (await notEnough(subtag, rawArgs)) {
                return this.errors.args.notEnough(1);
            } else if (await valid(subtag, rawArgs)) {
                let args = await this.parseArgs(subtag, context);
                return Bool.compare(operator, ...args);
            } else if (await tooMany(subtag, rawArgs)) {
                return this.errors.args.tooMany(2);
            }
        };
    }

    constructor(engine: Engine) {
        super(engine, 'bool', {
            category: 'system',
            globalName: ['bool'],
        });

        this.setNamedArgs([
            { key: 'a', optional: true },
            { key: 'operator' },
            { key: 'b' }
        ]);

        this.whenArgs(hasArgs(['a', 'operator', 'b']), this.run)
            .whenArgs(hasArgs(['operator', 'b']), this.run);

        this.engine.subtags.onceAdded(Operator as typeof SubTag, (operator: SubTag<any>) => {
            for (const key of Object.keys(Bool.operators)) {
                (operator as Operator).registerOperator(key, this.makeHandler(key));
            }
        });
    }

    public async run(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<boolean | SubTagError> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs, ['a', 'b', 'operator']);
        let arr: string[] = [];
        if (args.a) arr.push(<string>args.a);
        if (args.operator) arr.push(<string>args.operator);
        if (args.b) arr.push(<string>args.b);
        return Bool.compare(...arr);
    }

    public static getOperator(operator: string): comparer | undefined {
        operator = operator.toLowerCase();
        if (operator in this.operators) {
            return this.operators[operator];
        }
        return undefined;
    }

    public static compare(...args: string[]): boolean | SubTagError {
        let opFunc: comparer | undefined;
        let operator: string = '';
        for (const arg of args) {
            if (opFunc = this.getOperator(arg)) {
                operator = arg;
                args.splice(args.indexOf(arg), 1);
                break;
            }
        }
        if (opFunc === undefined) {
            return this.errors.value.notAComparer(args);
        }

        if (args.length === 1) {
            if (operator === '!') {
                let value = util.parseBool(args[0]);
                if (typeof value === 'boolean') {
                    return !value;
                }
                return this.errors.value.notABool(args[0]);
            }
            return this.errors.value.expected(['!'], [operator]);
        }
        if (args.length === 2) {
            return opFunc(args[0], args[1]);
        }
        return this.errors.args.tooMany(3);
    }
}