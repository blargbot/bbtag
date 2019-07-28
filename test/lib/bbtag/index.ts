import args from './args.test';
import check from './check.test';
import conditions from './conditions.test';
import convert from './convert.test';
import getType from './getType.test';
import parse from './parse.test';
import switchType from './switchType.test';

export default () => {
    describe('const args', args);
    describe('const check', check);
    describe('const conditions', conditions);
    describe('const convert', convert);
    describe('function getType', getType);
    describe('function parse', parse);
    describe('function switchType', switchType);
};