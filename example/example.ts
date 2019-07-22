import { blargbot, Engine, IDatabase } from '../';

const database: IDatabase = {} as any;
const engine = new Engine(blargbot.Context, database);

engine.subtags.register(...blargbot.subtags);
engine.variableScopes.register(...blargbot.variableScopes);