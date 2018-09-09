import { ArgumentManager, Engine, Converter, parse, ArgumentDefinition, BBSubTag, ValidationError } from '../dist/language.v2';
import { BBString } from '../dist';


async function testManager(subtag: string, definitions: ArgumentDefinition[], shouldThrow: boolean) {
    console.log('Mapping', subtag, 'to', definitions);
    let manager = new ArgumentManager(
        new Engine(null as any),
        new Converter(null as any),
        definitions,
        parse(subtag).parts.first() as any as BBSubTag,
        { addError() { } }
    );
    try {
        await manager.ready;
        console.log('Result:', [...((manager as any).argMap as Map<string, Array<BBSubTag | BBString>>)]
            .map(entry => { return { key: entry[0], values: entry[1].map(v => v.content) }; }));
    }
    catch (err) {
        if (!shouldThrow)
            console.error('Unexpected errors:', err.map((e: any) => { return { message: e.message, range: e.structure.range.toString() }; }));
        else
            console.log('Result:', err.map((e: any) => { return { message: e.message, range: e.structure.range.toString() }; }));
    }
    console.log('============');
}
async function test() {
    await testManager('{test}', [], false);
    await testManager('{test}', [{ name: 'arg1', desc: 'description', type: 'number' }], true);
    await testManager('{test;a}', [], true);
    await testManager('{test;2}', [{ name: 'arg1', desc: 'description', type: 'number' }], false);
    await testManager('{test;{*arg1;2}}', [{ name: 'arg1', desc: 'description', type: 'number' }], false);
    await testManager('{test;3;{*arg1;2}}', [{ name: 'arg1', desc: 'description', type: 'number' }], true);
    await testManager('{test;3;{*arg1;2}}', [{ name: 'arg1', desc: 'description', type: 'number', repeated: true }], false);
}

test();
