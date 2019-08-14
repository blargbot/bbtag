import { expect } from 'chai';
import args from '../../../lib/bbtag/args';
import check from '../../../lib/bbtag/check';
import compare from '../../../lib/bbtag/compare';
import conditions from '../../../lib/bbtag/conditions';
import convert from '../../../lib/bbtag/convert';
import errors from '../../../lib/bbtag/errors';
import getType from '../../../lib/bbtag/getType';
import bbUtil from '../../../lib/bbtag/index';
import parse from '../../../lib/bbtag/parse';
import switchType from '../../../lib/bbtag/switchType';

describe('const bbtag', () => {
    it('should correctly import all components', () => {
        // arrange

        // act

        // assert
        expect(bbUtil).to.not.be.undefined;
        expect(bbUtil.args).to.equal(args);
        expect(bbUtil.check).to.equal(check);
        expect(bbUtil.compare).to.equal(compare);
        expect(bbUtil.conditions).to.equal(conditions);
        expect(bbUtil.convert).to.equal(convert);
        expect(bbUtil.errors).to.equal(errors);
        expect(bbUtil.getType).to.equal(getType);
        expect(bbUtil.parse).to.equal(parse);
        expect(bbUtil.switchType).to.equal(switchType);
    });
});