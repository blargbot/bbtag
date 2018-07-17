import { SystemSubTag, Engine, hasCount, hasArgs, BBSubTag, Context } from './util';
import { RawArguments } from '../../../dist/structures/subtag';

export class Named extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'named', {
            category: 'mock'
        });

        this.setNamedArgs([
            { key: 'arg1' },
            { key: 'arg2', optional: true },
            { key: 'arg3' },
            { key: 'arg4', repeated: true, optional: true },
            { key: 'arg5' }
        ]);

        this.whenArgs(hasCount(0), this.errors.args.notEnough(1))
            .whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg4', 'arg5']), this.fiveArgs)
            .whenArgs(hasArgs(['arg1', 'arg3', 'arg4', 'arg5']), this.fourArgsOne)
            .whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg5']), this.fourArgsTwo)
            .whenArgs(hasArgs(['arg1', 'arg3', 'arg5']), this.threeArgs)
            .whenArgs(hasCount('>5'), this.errors.args.tooMany(5));
    }

    async fiveArgs(subtag: BBSubTag, context: Context, rawArgs?: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, ['arg1', 'arg2', 'arg3', 'arg4', 'arg5'], rawArgs);
        console.log(args);
        return 'Five ' + JSON.stringify(args);
    }
    async fourArgsOne(subtag: BBSubTag, context: Context, rawArgs?: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, ['arg1', 'arg3', 'arg4', 'arg5'], rawArgs);
        console.log(args);
        return 'Four1 ' + JSON.stringify(args);
    }
    async fourArgsTwo(subtag: BBSubTag, context: Context, rawArgs?: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, ['arg1', 'arg2', 'arg3', 'arg5'], rawArgs);
        console.log(args);
        return 'Four2 ' + JSON.stringify(args);
    }
    async threeArgs(subtag: BBSubTag, context: Context, rawArgs?: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, ['arg1', 'arg3', 'arg5'], rawArgs);
        console.log(args);
        return 'Three ' + JSON.stringify(args);
    }
}