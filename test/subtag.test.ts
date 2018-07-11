(async () => {
    let subtags: { [key: string]: { [key: string]: VoidFunction } } = {};

    // Basic subtags
    subtags.General = {};
    subtags.General.Comment = await import('./subtag/comment.test');
    subtags.General.Bool = await import('./subtag/bool.test');
    subtags.General.If = await import('./subtag/if.test');

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