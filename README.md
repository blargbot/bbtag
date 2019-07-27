[![Build status](https://ci.appveyor.com/api/projects/status/gs8umkj8o7pu41sg/branch/master?svg=true)](https://ci.appveyor.com/project/Titansmasher/bbtag/branch/master)

# BBTag
BBTag is a templating language initially developed as part of the [blargbot](https://blargbot.xyz/) discord bot. The core structure of the language is based around subtags, defined by a `{}` pair enclosing a name and arguments being split by a `;` character. 

## Project structure
- **[/lib](/lib)** - This is the main brains behind BBTag. All code related to the parsing and execution of the language is here. This does not include the implementations of any subtags.
- **[/system](/system)** - Features which require no additional input or support outside of that of the base language. These are mostly your math, text and branching related subtags, as well as some basic variable scopes.
- **[/discord](/discord)** - Features which require access to a discord client. These are the subtags which can interact with discord users, channels, messages etc, as well as discord related variable scopes.
- **[/blargbot](/blargbot)** - Features which require features specific to blargbot. These are the subtags which interact with blargbots moderation features, and its text dump feature.
- **[/samples](/samples)** - Sample code for how to implement the interfaces which various bbtag features rely on, as well as how to set up a BBTag engine.
- **[/test](/test)** - All the tests for BBTag. The tests structure matches the above files and their contents, with each source file having a corresponding `.test.ts` file

## Getting started
For help using the language on blargbot, please visit the [blargbot website](https://blargbot.xyz/tags).

### Prerequisites
- [Node.js](https://nodejs.org/) 10.14.0+
- [VSCode](https://code.visualstudio.com/) (reccommended, not required)

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
npm run watch
```
You can now start developing and your changes will be compiled as you work.

### Running the tests
There are tests set up with the intention of covering all the code written for this project. To run the tests and generate a code coverage report run
```
npm run coverage
```
The code coverage report will be viewable in a html format located at `/coverage/index.html`.
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
