import check from './check';
import { SubtagResult, SubtagResultTypeMap } from './types';

export function getType(target: SubtagResult): keyof SubtagResultTypeMap {
    switch (typeof target) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
    }
    if (check.array(target)) {
        return 'array';
    }
    if (check.error(target)) {
        return 'error';
    }
    return 'null';
}

export default getType;
