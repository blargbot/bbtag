import { hasCount, Engine, SystemSubTag, BBSubTag, Context } from './util';

export class Join extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'join', { category: 'mocks' });

        this.whenArgs(hasCount('>=0'), this.echo);
    }

    async echo(subtag: BBSubTag, context: Context): Promise<string> {
        let result = await this.parseArgs(subtag, context)
        return result.join(', ');
    }
}