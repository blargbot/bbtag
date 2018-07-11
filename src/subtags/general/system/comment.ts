import { Engine, BBSubTag, Context, SystemSubTag } from '../util';

export class Comment extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, '//', {
            category: 'system',
            globalName: ['//']
        });
    }

    public execute(subtag: BBSubTag, context: Context): Promise<string> {
        return Promise.resolve('');
    }
}