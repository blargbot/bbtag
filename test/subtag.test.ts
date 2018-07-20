(async () => {
    let subtags: { [key: string]: { [key: string]: VoidFunction } } = {};

    // Mock subtags
    subtags.Mock = {};
    subtags.Mock.Named = await import('./subtag/namedargs.test');

    // Basic subtags
    subtags.System = {};
    subtags.System.Comment = await import('./subtag/comment.test');
    subtags.System.Bool = await import('./subtag/bool.test');
    subtags.System.If = await import('./subtag/if.test');
    subtags.System.Switch = await import('./subtag/switch.test');
    subtags.System.Operator = await import('./subtag/operator.test');

    subtags.Math = {};
    subtags.Math.Floor = await import('./subtag/floor.test');

    subtags.Array = {};

    // Discord subtags
    subtags.Channel = {};

    subtags.Guild = {};

    subtags.Message = {};

    subtags.Role = {};

    subtags.User = {};

    // Bot subtags
    subtags.Bot = {};

    describe('Subtags', async () => {
        for (const category in subtags) {
            describe(category, () => {
                for (const subtag in subtags[category]) {
                    describe(subtag, subtags[category][subtag])
                }
            })
        }
    });
})();