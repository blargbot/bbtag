import { Engine } from '../../engine';
import { hasCount } from '../../structures/subtag.conditions';
import { BBSubTag } from '../../language';
import { Context } from '../../structures/context';
import { SystemSubTag, SubTagError } from '../../structures/subtag';

export class Floor extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'floor', {
            category: 'Math',
            globalName: ['floor', 'rounddown'],
            alias: ['rounddown']
        });

        this.whenArgs(hasCount(0), this.errors.arguments.notEnough(1))
            .whenArgs(hasCount(1), this.floor)
            .whenArgs(hasCount('>1'), this.errors.arguments.tooMany(1));
    }

    async floor(subtag: BBSubTag, context: Context): Promise<number | SubTagError> {
        let [value] = await this.parseArgs(subtag, context);
        let parsed = parseFloat(value);
        if (isNaN(parsed))
            return this.errors.value.notANumber(value);
        return Math.floor(parsed);
    }
}