import { VariableScope } from '../..';

export default new VariableScope({ // Temporary '~'
    name: 'Temporary',
    prefix: '~',
    description:
        'Temporary variables are never stored to the database, meaning they are by far the fastest variable type.\n' +
        'If you are working with data which you only need to store for later use within the same tag call, ' +
        'then you should use temporary variables over any other type',
    set(): void { },
    setBulk(): void { },
    get(): '' { return ''; },
    delete(): void { },
    getKey(): Iterable<string> { return []; }
});