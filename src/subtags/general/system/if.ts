import { Engine, hasCount, BBSubTag, Context, SystemSubTag, SubTagError, util } from '../util';

export class If extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'if', {
            category: 'system',
            globalName: ['if']
        });


    }
}