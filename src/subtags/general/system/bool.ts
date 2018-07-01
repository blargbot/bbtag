import { Engine, hasCount, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';

type comparer = (a: string, b: string) => boolean;

export class Bool extends SystemSubTag {
    public static readonly operator_definitions = {
        '==': ((a, b) => util.Comparer.Default.areEqual(a, b)) as comparer,
        '!=': ((a, b) => util.Comparer.Default.notEqual(a, b)) as comparer,
        '>': ((a, b) => util.Comparer.Default.greaterThan(a, b)) as comparer,
        '>=': ((a, b) => util.Comparer.Default.greaterOrEqual(a, b)) as comparer,
        '<': ((a, b) => util.Comparer.Default.lessThan(a, b)) as comparer,
        '<=': ((a, b) => util.Comparer.Default.lessOrEqual(a, b)) as comparer,
        'startswith': ((a, b) => util.Comparer.Default.startsWith(a, b)) as comparer,
        'endswith': ((a, b) => util.Comparer.Default.endsWith(a, b)) as comparer,
        'contains': ((a, b) => util.Comparer.Default.includes(a, b)) as comparer,
    }

    public static readonly operator_aliases = {
        '=': Bool.operator_definitions['=='],
        '!': Bool.operator_definitions['!='],
        'sw': Bool.operator_definitions['startswith'],
        'ew': Bool.operator_definitions['endswith'],
        'inc': Bool.operator_definitions['contains'],
        'includes': Bool.operator_definitions['contains']
    }

    public static readonly operators = {
        ...Bool.operator_definitions,
        ...Bool.operator_aliases
    }

    constructor(engine: Engine) {
        super(engine, 'bool', {
            category: 'system',
            globalName: ['bool'],
        });

        this.whenArgs(hasCount('<2'), this.errors.args.notEnough(2))
            .whenArgs(hasCount('2-3'), this.run)
            .whenArgs(hasCount('>3'), this.errors.args.tooMany(3));
    }

    public async run(subtag: BBSubTag, context: Context): Promise<boolean | SubTagError> {
        let args = await this.parseArgs(subtag, context);
        return Bool.compare(...args);
    }

    public static getOperator(operator: string): comparer | undefined {
        operator = operator.toLowerCase();
        if (operator in this.operators) {
            return (<any>this.operators)[operator];
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
            return this.errors.value.expected(Object.keys(this.operators), args);
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