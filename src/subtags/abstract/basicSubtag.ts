import { ISubtagOptions, Subtag, SubtagContext } from '../../structures';

export abstract class BasicSubtag extends Subtag<SubtagContext> {
    protected constructor(args: Omit<ISubtagOptions<SubtagContext>, 'contextType'>) {
        super({
            ...args,
            contextType: SubtagContext
        });
    }
}