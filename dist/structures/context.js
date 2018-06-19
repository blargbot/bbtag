"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const variables_1 = require("./variables");
const scope_1 = require("./scope");
const state_1 = require("./state");
class Context {
    constructor(engine, options) {
        this.engine = engine;
        this.variables = new variables_1.VariableManager(this, this.engine);
        this.scope = new scope_1.Scope();
        this.state = new state_1.StateManager();
        options = options || {};
        this.runMode = options.runMode || RunMode.restricted;
        this.permission = options.permission || Permission.low;
    }
    serialize() {
    }
}
exports.Context = Context;
class DiscordContext extends Context {
    get msg() { return this.message; }
    constructor(engine, message, author, options) {
        options = options || {};
        super(engine, options);
        this.message = message;
        this.channel = message.channel;
        this.user = message.author;
        this.author = author;
        if (this.channel.hasOwnProperty('guild')) {
            this.guildChannel = this.channel;
            this.guild = this.guildChannel.guild;
        }
    }
}
exports.DiscordContext = DiscordContext;
var RunMode;
(function (RunMode) {
    RunMode[RunMode["full"] = 1] = "full";
    RunMode[RunMode["restricted"] = 2] = "restricted"; // tags
})(RunMode = exports.RunMode || (exports.RunMode = {}));
var Permission;
(function (Permission) {
    Permission[Permission["admin"] = 1] = "admin";
    Permission[Permission["elevated"] = 2] = "elevated";
    Permission[Permission["low"] = 3] = "low"; // user
})(Permission = exports.Permission || (exports.Permission = {}));
