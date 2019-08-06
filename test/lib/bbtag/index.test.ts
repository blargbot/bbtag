import { expect } from 'chai';
import args from '../../../lib/bbtag/args';
import check from '../../../lib/bbtag/check';
import compare from '../../../lib/bbtag/compare';
import conditions from '../../../lib/bbtag/conditions';
import convert from '../../../lib/bbtag/convert';
import errors from '../../../lib/bbtag/errors';
import getType from '../../../lib/bbtag/getType';
import bbtag from '../../../lib/bbtag/index';
import parse from '../../../lib/bbtag/parse';
import switchType from '../../../lib/bbtag/switchType';

describe('const bbtag', () => {
    it('should correctly import all components', () => {
        // arrange

        // act

        // assert
        expect(bbtag).to.not.be.undefined;
        expect(bbtag.args).to.equal(args);
        expect(bbtag.check).to.equal(check);
        expect(bbtag.compare).to.equal(compare);
        expect(bbtag.conditions).to.equal(conditions);
        expect(bbtag.convert).to.equal(convert);
        expect(bbtag.errors).to.equal(errors);
        expect(bbtag.getType).to.equal(getType);
        expect(bbtag.parse).to.equal(parse);
        expect(bbtag.switchType).to.equal(switchType);
    });
});