import { Engine, hasCount, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';
import { satisfies } from '../../bot/util';

export class Comment extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, '//', {
            category: 'system',
            globalName: ['//']
        });

        this.whenArgs(satisfies(() => true), this.doNothing);
    }

    public doNothing(): Promise<void> {
        return Promise.resolve();
    }
}