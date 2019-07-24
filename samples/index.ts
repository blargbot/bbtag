import * as bbtag from '..'; // 'bbtag'
import * as blargbot from '../blargbot'; // 'bbtag/blargbot'
import * as discord from '../discord'; // 'bbtag/discord'
import * as system from '../system'; // 'bbtag/system'

import { InMemoryBlargbot } from './blargbot';
import { InMemoryDatabase } from './database';
import { InMemoryDiscord } from './discord';

const database = new InMemoryDatabase();
const client = new InMemoryDiscord();
const bot = new InMemoryBlargbot(client);
const engine = new bbtag.Engine(blargbot.BlargbotContext, database);

engine.subtags.register(...system.subtags);
engine.subtags.register(...discord.subtags);
engine.subtags.register(...blargbot.subtags);

engine.variableScopes.register(...system.variableScopes);
engine.variableScopes.register(...discord.variableScopes);
engine.variableScopes.register(...blargbot.variableScopes);

import * as lines from './bbtag/notes.bbtag.json';
const bbtagNotes = lines.join('\n');

const processContext = new blargbot.BlargbotContext(engine, {
    name: 'notes',
    scope: 'tag',
    blargbot: bot,
    message: client.createMessage('b!t notes', discord.ChannelType.GuildText, 'name'),
    self: client.getSelf(),
    isUserStaff: () => true
});

const parsed = engine.process(bbtagNotes, processContext);

const execContext = new blargbot.BlargbotContext(engine, {
    name: 'notes',
    scope: 'tag',
    blargbot: bot,
    message: client.createMessage('b!t notes', discord.ChannelType.GuildText, 'name'),
    self: client.getSelf(),
    isUserStaff: () => true
});

Promise.resolve(engine.execute(parsed.root, execContext))
    .then(result => {
        // tslint:disable-next-line: no-console
        console.debug(result);
    });
