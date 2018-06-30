(async function () {
    let utils: { [key: string]: VoidFunction } = {
        Array: (await import('./util/array.test')).test
    };
    describe('Util', () => {
        for (const key in utils) {
            describe(key, utils[key])
        }
    });
})();