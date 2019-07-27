import { SubtagContext, VariableScope } from '../../lib';

export default new VariableScope(SubtagContext, { // Local ''
    name: 'Local',
    prefix: '',
    description:
        'Local variables are the default variable type, only usable if your variable name doesnt start with ' +
        'one of the other prefixes. These variables are only accessible by the tag that created them, meaning ' +
        'there is no possibility to share the values with any other tag.\n' +
        'These are useful if you are intending to create a single tag which is usable anywhere, as the variables ' +
        'are not confined to a single server, just a single tag',
    getKey(context: SubtagContext, key: string): Iterable<string> {
        return ['LOCAL', context.tagName, context.scope, key];
    }
});