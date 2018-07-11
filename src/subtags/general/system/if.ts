import { Engine, hasCount, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';
import { Bool } from './bool';

export class If extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'if', {
            category: 'system',
            globalName: ['if']
        });

        this.whenArgs(hasCount('<2'), this.errors.args.notEnough(2))
            .whenArgs(hasCount('2-5'), this.run)
            .whenArgs(hasCount('>5'), this.errors.args.tooMany(5));
    }

    private parseBool(text: string): boolean | SubTagError {
        let result = util.parseBool(text);
        if (typeof result === 'boolean')
            return result;
        return this.errors.value.notABool(text);
    }

    public async run(subtag: BBSubTag, context: Context): Promise<string | SubTagError> {
        let success: boolean | SubTagError = false,
            then: number = -1,
            otherwise: number = -1;
        switch (subtag.args.length) {
            case 3:
                otherwise = 2;
            case 2:
                success = this.parseBool(await this.parseArg(subtag, context, 0));
                then = 1;
                break;
            case 5:
                otherwise = 4;
            case 4:
                success = await Bool.compare(...await this.parseArgs(subtag, context, [0, 1, 2]));
                then = 3;
        }

        if (typeof success === 'function')
            return success;

        return await this.parseArg(subtag, context, success ? then : otherwise) || '';
    }
}