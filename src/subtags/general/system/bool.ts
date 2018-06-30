import { Engine, hasCount, BBSubTag, Context, SystemSubTag, SubTagError } from '../util';


export class Bool extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'bool', {
            category: 'system',
            globalName: ['bool', 'does'],
            alias: ['does']
        });
    }
}