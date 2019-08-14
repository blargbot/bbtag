import { expect } from 'chai';
import args from '../../../lib/bbUtil/args';
import check from '../../../lib/bbUtil/check';
import compare from '../../../lib/bbUtil/compare';
import conditions from '../../../lib/bbUtil/conditions';
import convert from '../../../lib/bbUtil/convert';
import errors from '../../../lib/bbUtil/errors';
import getType from '../../../lib/bbUtil/getType';
import bbUtil from '../../../lib/bbUtil/index';
import parse from '../../../lib/bbUtil/parse';
import switchType from '../../../lib/bbUtil/switchType';

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