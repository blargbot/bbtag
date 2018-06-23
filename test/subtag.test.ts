(async function () {
    let subtags: { [key: string]: { [key: string]: VoidFunction } } = {
        Math: {
            Floor: (await import('./subtag/floor')).test
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