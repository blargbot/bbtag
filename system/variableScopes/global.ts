import { SubtagContext, VariableScope } from '../..';

export default new VariableScope({ // Global '*'
    name: 'Global',
    prefix: '*',
    description:
        'Global variables are completely public, anyone can read **OR EDIT** your global variables.\n' +
        'These are very useful if you like pain.',
    getKey(_: SubtagContext, key: string): Iterable<string> {
        return ['GLOBAL', key];
    }
});