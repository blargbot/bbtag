import { SystemSubTag, Engine, hasCount, BBSubTag, Context } from './util';
import { BBString, satisfies } from '../../../dist';

export class Func extends SystemSubTag {
    constructor(engine: Engine) {
        super(engine, 'func', {
            category: 'mock'
        });

        this.whenArgs(hasCount('<2'), this.errors.args.notEnough(1))
            .whenArgs(hasCount(2), this.addFunc)
            .whenArgs(hasCount('>1'), this.errors.args.tooMany(1));
    }

    async addFunc(subtag: BBSubTag, context: Context): Promise<void> {
        let [name] = await this.parseArgs(subtag, context, 0);
        context.functions.add(new FuncHandler(this.engine, name, subtag.args[1]));
    }
}

export class FuncHandler extends SystemSubTag {
    public readonly code: BBString;

    constructor(engine: Engine, name: string, code: BBString) {
        super(engine, name, {
            category: 'mockFunc'
        });
        this.code = code;
        this.whenArgs(satisfies(() => true), this.run)
    }

    async run(subtag: BBSubTag, context: Context): Promise<string> {
        return await this.engine.execute(this.code, context);
    }
}