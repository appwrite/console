import { objectEntries } from '$lib/helpers/object';

test('objectEntries', () => {
    const object = {
        a: 1,
        b: 2,
        c: 3
    };

    expect(objectEntries(object)).toEqual(Object.entries(object));
});
