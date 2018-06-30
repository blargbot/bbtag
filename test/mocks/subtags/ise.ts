import { hasCount, Engine, SystemSubTag, BBSubTag, Context } from './util';
import { satisfies } from '../../../dist';

export class ISE extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'ise', { category: 'mocks' });

        this.whenArgs(satisfies(() => true), this.throw);
    }

    async throw() {
        throw new Error('test');
    }
}