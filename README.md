[![Build status](https://ci.appveyor.com/api/projects/status/gs8umkj8o7pu41sg/branch/master?svg=true)](https://ci.appveyor.com/project/Titansmasher/bbtag/branch/master)

# BBTag
BBTag is a templating language initially developed for the [blargbot](https://blargbot.xyz/) discord bot. The core structure of the language is based around the positioning of subtags, defined by a `{}` pair, with arguments being split by a `;` character.

## Categories
SubTags are split up into varying categories. Subtags within each category can be accessed by `{category.function}`. Many functions are also available on the global level, meaning you are able to directly access them through `{function}`.
#### General
These subtags are implementations of general programming concepts. These are independent from any discord or bot functionality, and can be easily repurposed to other applications.
- **[System](/src/subtags/general/system)** - All subtags relating to general programming concepts
- **[Array](/src/subtags/general/array)** - All subtags relating to the manipulation and usage of arrays. Arrays are rendered out as a json string following the pattern `{"n":"arrayName","v":[1,2,3]}` if it has come from a variable, otherwise `[1,2,3]`
- **[Math](/src/subtags/general/math)** - All subtags that work with number manipulation

#### Discord
These subtags are all related to discord, and so require that a `DiscordContext` be supplied to the engine upon execution.
- **[Message](/src/subtags/discord/message)** - All subtags that are used for interacting with discord messages
- **[Role](/src/subtags/discord/role)** - All subtags that are used for interacting with discord roles
- **[Guild](/src/subtags/discord/guild)** - All subtags that are used for interacting with discord guilds
- **[Channel](/src/subtags/discord/channel)** - All subtags that are used for interacting with discord channels
- **[User](/src/subtags/discord/channel)** - All subtags that are used for interacting with discord users
  
#### Blargbot
These subtags are used for interacting with blargbots features, and so require a `BotContext` to be supplied to the engine upon execution.
- **[Bot](/src/subtags/bot)** - All subtags used for interacting with blargbot directly

## Getting started
For help using the language on blargbot, please visit the [blargbot website](https://blargbot.xyz/tags).
### Prerequisites
- Node.js 6+

### Installing
1. Clone this repository
```
git clone https://github.com/blargbot/bbtag.git
```
2. Install the dependent packages
```
npm install
```
3. Run the typescript compiler in watch mode
```
npm run build
```
You can now start developing within the `/src` folder and your changes will be compiled as you work.

### Running the tests
There are tests set up with the intention of covering all the code written for this project. To run them, you simply need to use
```
npm run test
```
All tests should successfully pass. This is verified by our [CI process](https://ci.appveyor.com/project/Titansmasher/bbtag). All tests must pass before any PR will be accepted.

## Built with
- [Node.js](https://nodejs.org/)
- [Typescript](https://www.typescriptlang.org/)

## Authors
- **[Stupid Cat](https://github.com/Ratismal)** - *initial implementation*
- **[Titansmasher](https://github.com/Titansmasher)**

See also the list of [contributors](https://github.com/blargbot/bbtag/graphs/contributors) who participated in this project.

## License 
This project is licensed under the GNU AGPLv3 License - see the [LICENSE.md](/LICENSE.md) file for more information
