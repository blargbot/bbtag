import { SystemSubTag, Context, BBSubTag, BBString, Engine } from '../util';
import { SubTagHandler } from '../../../structures/subtag';

export class Operator extends SystemSubTag {
    private readonly operators: { [key: string]: SubTagHandler<any> } = {};

    constructor(engine: Engine) {
        super(engine, 'operator', {
            category: 'system'
        });

        this.whenArgs(() => true, this.run);
        Object.defineProperty(this, 'globalNames', {
            get: () => { return Object.keys(this.operators); }
        });
    }

    public registerOperator(operators: string | string[], handler: SubTagHandler<any>) {
        if (!Array.isArray(operators))
            operators = [operators];
        for (const operator of operators) {
            this.operators[operator] = handler;
        }

        this.engine.subtags.reload(this);
    }

    public async run(subtag: BBSubTag, context: Context) {
        let operator = subtag.resolvedName.toLowerCase();
        let handler = this.operators[operator];
        if (handler != null) {
            return await handler(subtag, context, {});
        }

        return this.errors.value.notAnOperator(operator);
    }
}