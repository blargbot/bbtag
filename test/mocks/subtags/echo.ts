import { SystemSubTag, Engine, hasCount, BBSubTag, Context } from './util';

export class Echo extends SystemSubTag {
    public static readonly values: string[] = [];

    constructor(engine: Engine) {
        super(engine, 'echo', {
            category: 'mock',
            globalName: ['echo', '_']
        });

        this.whenArgs(hasCount(0), this.errors.args.notEnough(1))
            .whenArgs(hasCount(1), this.echo)
            .whenArgs(hasCount('>1'), this.errors.args.tooMany(1));
    }

    async echo(subtag: BBSubTag, context: Context): Promise<string> {
        let [result] = await this.parseArgs(subtag, context);
        Echo.values.push(result);
        return result;
    }
}