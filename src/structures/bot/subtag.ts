import { SubTag, SubTagOptions, BaseSubtagOptions } from "../subtag";
import { BotContext } from "./context";
import { Engine } from "../../engine";

export abstract class BotSubTag extends SubTag<BotContext> {
    constructor(engine: Engine, name: string, options?: SubTagOptions) {
        let _options = <BaseSubtagOptions<BotContext>>options || {};
        _options.context = BotContext;
        super(engine, name, _options);
    }
}