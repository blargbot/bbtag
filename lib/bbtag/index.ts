import check from './check';
import compare from './compare';
import convert from './convert';
import errors from './errors';
import getType from './getType';
import parse from './parse';
import serializers from './serialize';
import switchType from './switchType';

export * from './types';

export const bbtag = {
    check,
    compare,
    convert,
    errors: errors,
    getType,
    parse,
    serializers,
    switchType
};

export default bbtag;