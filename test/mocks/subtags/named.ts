import { SystemSubTag, Engine, hasCount, hasArgs, BBSubTag, Context } from './util';
import { RawArguments } from '../../../dist/structures/subtag';

export class Named1 extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'named1', {
            category: 'mock'
        });

        this.setNamedArgs([
            { key: 'arg1' },
            { key: 'arg2', optional: true },
            { key: 'arg3' },
            { key: 'arg4', repeated: true, optional: true },
            { key: 'arg5' }
        ]);

        this.whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg4', 'arg5']), this.fiveArgs)
            .whenArgs(hasArgs(['arg1', 'arg3', 'arg4', 'arg5']), this.fourArgsOne)
            .whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg5']), this.fourArgsTwo)
            .whenArgs(hasArgs(['arg1', 'arg3', 'arg5']), this.threeArgs);
    }

    async fiveArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Five ' + JSON.stringify(args);
    }
    async fourArgsOne(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Four1 ' + JSON.stringify(args);
    }
    async fourArgsTwo(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Four2 ' + JSON.stringify(args);
    }
    async threeArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Three ' + JSON.stringify(args);
    }
}

export class Named2 extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'named2', {
            category: 'mock'
        });

        this.setNamedArgs([
            { key: 'arg1' },
            { key: 'arg2', optional: true },
            { key: 'arg3' },
            { key: 'arg4', repeated: true },
            { key: 'arg5' }
        ]);

        this
            .whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg4', 'arg5']), this.fiveArgs)
            .whenArgs(hasArgs(['arg1', 'arg3', 'arg4', 'arg5']), this.fourArgsOne)
            .whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg5']), this.fourArgsTwo)
            .whenArgs(hasArgs(['arg1', 'arg3', 'arg5']), this.threeArgs);
    }

    async fiveArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Five ' + JSON.stringify(args);
    }
    async fourArgsOne(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Four1 ' + JSON.stringify(args);
    }
    async fourArgsTwo(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Four2 ' + JSON.stringify(args);
    }
    async threeArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Three ' + JSON.stringify(args);
    }
}


export class NamedPriority extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'namedp', {
            category: 'mock'
        });

        this.setNamedArgs([
            { key: 'arg1', optional: true },
            { key: 'arg2', optional: true, priority: true }
        ]);

        this.whenArgs(hasArgs(['arg1', 'arg2']), this.twoArgs)
            .whenArgs(hasArgs(['arg2']), this.oneArg);
    }

    async oneArg(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'One ' + JSON.stringify(args);
    }
    async twoArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Two ' + JSON.stringify(args);
    }
}

export class NamedConditional extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'namedc', {
            category: 'mock'
        });

        this.setNamedArgs([
            { key: 'arg1', optional: true, conditional: 'arg3' },
            { key: 'arg2', optional: true, conditional: 'arg1' },
            { key: 'arg3', optional: true, conditional: 'arg2' },
            { key: 'arg4', optional: true }
        ]);

        this.whenArgs(hasArgs(['arg1', 'arg2', 'arg3', 'arg4']), this.fourArgs)
            .whenArgs(hasArgs(['arg1', 'arg2', 'arg3']), this.threeArgs)
            .whenArgs(hasArgs(['arg4']), this.oneArg)
            .default(this.errors.args.notEnough(1));
    }

    async oneArg(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'One ' + JSON.stringify(args);
    }
    async threeArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Three ' + JSON.stringify(args);
    }
    async fourArgs(subtag: BBSubTag, context: Context, rawArgs: RawArguments): Promise<string> {
        let { args } = await this.parseNamedArgs(subtag, context, rawArgs);
        return 'Four ' + JSON.stringify(args);
    }
}