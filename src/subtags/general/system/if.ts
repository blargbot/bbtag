import { Engine, hasCount, hasArgs, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';
import { Bool } from './bool';
import { RawArguments } from '../../../structures/subtag';

export class If extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'if', {
            category: 'system',
            globalName: ['if']
        });

        this.setNamedArgs([
            { key: 'a' },
            { key: 'operator', optional: true, conditional: 'b' },
            { key: 'b', optional: true, conditional: 'operator' },
            { key: 'then' },
            { key: 'else', optional: true }
        ]);

        this.whenArgs(hasArgs(['a', 'operator', 'b', 'then', 'else']), this.run)
            .whenArgs(hasArgs(['a', 'operator', 'b', 'then']), this.run)
            .whenArgs(hasArgs(['a', 'then', 'else']), this.run)
            .whenArgs(hasArgs(['a', 'then']), this.run);
    }

    private parseBool(text: string): boolean | SubTagError {
        let result = util.parseBool(text);
        if (typeof result === 'boolean')
            return result;
        return this.errors.value.notABool(text);
    }

    public async run(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string | SubTagError> {
        let success: boolean | SubTagError = false;
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs, ['a', 'b', 'operator']);

        if (args.a && args.operator && args.b) {
            success = await Bool.compare(<string>args.a, <string>args.operator, <string>args.b);
        } else if (!args.operator && !args.b) {
            success = this.parseBool(<string>args.a);
        }

        if (typeof success === 'function')
            return success;

        return <string>await this.parseNamedArg(subtag, context, rawArgs, success ? 'then' : 'else') || '';
    }
}