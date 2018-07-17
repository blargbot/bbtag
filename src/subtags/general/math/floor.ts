import { Engine, hasCount, hasArgs, BBSubTag, Context, SystemSubTag, SubTagError } from '../util';

export class Floor extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'floor', {
            category: 'Math',
            globalName: ['floor', 'rounddown'],
            alias: ['rounddown']
        });

        // this.setNamedArgs([
        //     { key: 'number' }
        // ]);

        this.whenArgs(hasCount(0), this.errors.args.notEnough(1))
            // .whenArgs(hasArgs(['number']), this.floor)
            .whenArgs(hasCount(1), this.floor)
            .whenArgs(hasCount('>1'), this.errors.args.tooMany(1));
    }

    async floor(subtag: BBSubTag, context: Context): Promise<number | SubTagError> {
        let [value] = await this.parseArgs(subtag, context);
        let parsed = parseFloat(value);
        if (isNaN(parsed))
            return this.errors.value.notANumber(value);
        return Math.floor(parsed);
    }
}