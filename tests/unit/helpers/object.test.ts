import { isObjectType, objectEntries } from '$lib/helpers/object';

test('objectEntries', () => {
    const object = {
        a: 1,
        b: 2,
        c: 3
    };

    expect(objectEntries(object)).toEqual(Object.entries(object));
});

test('isObjectType', () => {
    type TestType = {
        a: string;
        b: number;
        c: string | number;
        d: string[];
        e: {
            f: string;
            g: number;
        };
        h: undefined | null | string;
    };

    const valid_type = {
        a: '1',
        b: 1,
        c: '1',
        d: ['1', '2'],
        e: {
            f: '1',
            g: 1
        },
        h: null
    };

    const invalid_type = {
        a: 1,
        b: '1',
        c: true
    };

    const invalid_type_2 = {
        ...valid_type,
        d: [1, '2']
    };

    const invalid_type_3 = {
        ...valid_type,
        c: null
    };

    const isTestType = (value: unknown): value is TestType => {
        return isObjectType(value, {
            a: 'string',
            b: 'number',
            c: ['string', 'number'],
            d: (v) => Array.isArray(v) && v.every((v) => typeof v === 'string'),
            e: (v) =>
                isObjectType(v, {
                    f: 'string',
                    g: 'number'
                }),
            h: (v) => v === null || v === undefined || typeof v === 'string'
        });
    };

    expect(isTestType(valid_type)).toBe(true);
    expect(isTestType(invalid_type)).toBe(false);
    expect(isTestType(invalid_type_2)).toBe(false);
    expect(isTestType(invalid_type_3)).toBe(false);
    expect(isTestType('12331')).toBe(false);
});
