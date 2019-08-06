import args from './args';
import check from './check';
import compare from './compare';
import conditions from './conditions';
import convert from './convert';
import errors from './errors';
import getType from './getType';
import parse from './parse';
import switchType from './switchType';
import { IBBTagUtilities } from './types';

export * from './types';

export const bbtag: IBBTagUtilities = {
    args,
    check,
    compare,
    conditions,
    convert,
    errors,
    getType,
    parse,
    switchType
};

export default bbtag;