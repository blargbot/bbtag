import check from './check';
import compare from './compare';
import convert from './convert';
import getType from './getType';
import parse from './parse';
import serializers from './serialize';
import switchType from './switchType';

export * from './types';

export const bbtag = {
    check,
    compare,
    convert,
    getType,
    parse,
    serializers,
    switchType
};

export default bbtag;