import { DiscordContext } from './context';
import { SubTag, SubTagOptions, BaseSubtagOptions } from '../subtag';
import { Engine } from '../../engine';

export abstract class DiscordSubTag extends SubTag<DiscordContext> {
    constructor(engine: Engine, name: string, options?: SubTagOptions) {
        let _options = <BaseSubtagOptions<DiscordContext>>options || {};
        _options.context = DiscordContext;
        super(engine, name, _options);
    }
}