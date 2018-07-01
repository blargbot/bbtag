(async function () {
    let subtags: { [key: string]: { [key: string]: VoidFunction } } = {
        Math: {
            Floor: (await import('./subtag/floor.test')).test
        },
        General: {
            Comment: (await import('./subtag/comment.test')).test,
            Bool: (await import('./subtag/bool.test')).test,
        }
    };
    describe('Subtags', () => {
        for (const category in subtags) {
            describe(category, () => {
                for (const subtag in subtags[category]) {
                    describe(subtag, subtags[category][subtag])
                }
            })
        }
    });
})();