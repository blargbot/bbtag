import { Engine, hasCount, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';

export class Switch extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'switch', {
            category: 'system',
            globalName: ['switch']
        });

        this.whenArgs(hasCount('<2'), this.errors.args.notEnough(2))
            .whenArgs(hasCount('>=2'), this.run);
    }

    public async run(subtag: BBSubTag, context: Context): Promise<string | SubTagError> {
        let value = await this.parseArg(subtag, context, 0);
        let cases: { [key: string]: number } = {};
        let fallback = subtag.args.length % 2 === 0 ? subtag.args.length - 1 : -1;
        let caseEnd = subtag.args.length - 1;
        if (fallback !== -1)
            caseEnd--;

        for (let i = 1; i < caseEnd; i += 2) {
            let executed = await this.parseArg(subtag, context, i);
            let deserialized = util.array.deserialize(executed);

            let entries = deserialized !== undefined ? deserialized.v : [executed];

            for (const entry of entries) {
                if (!(entry in cases)) {
                    cases[entry] = i + 1;
                }
            }
        }

        return await this.parseArg(subtag, context, cases[value] || fallback);
    }
}