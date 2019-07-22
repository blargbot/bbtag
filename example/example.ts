import { BlargbotContext, Engine, IDatabase, subtags, variableScopes } from '../';

const database: IDatabase = {} as any;
const engine = new Engine(BlargbotContext, database);

engine.subtags.register(...subtags.all);
engine.variableScopes.register(...variableScopes);