import { Engine, hasCount, hasArgs, BBSubTag, Context, SystemSubTag, SubTagError } from '../util';
import { RawArguments } from '../../../structures/subtag';

export class Floor extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'floor', {
            category: 'Math',
            globalName: ['floor', 'rounddown'],
            alias: ['rounddown']
        });

        this.setNamedArgs([
            { key: 'number' }
        ]);

        this.whenArgs(hasArgs(['number']), this.floor);
    }

    async floor(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<number | SubTagError> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        let parsed = parseFloat(<string>args.number);
        if (isNaN(parsed))
            return this.errors.value.notANumber(<string>args.number);
        return Math.floor(parsed);
    }
}