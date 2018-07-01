(async function () {
    let utils: { [key: string]: VoidFunction } = {
        Array: (await import('./util/array.test')).test,
        Comparer: (await import('./util/comparer.test')).test,
        Parse: (await import('./util/parse.test')).test,
        Generic: (await import('./util/generic.test')).test,
    };
    describe('Util', () => {
        for (const key in utils) {
            describe(key, utils[key])
        }
    });
})();