import { isTabSelected } from '$lib/helpers/load';

describe('isTabSelected()', () => {
    const tabs = {
        a: { href: '/a', title: 'A' },
        b: { href: '/b', title: 'B' },
        c: { href: '/c', title: 'C', hasChildren: true }
    };
    const tabsArray = Object.values(tabs);

    const tests = [
        {
            name: 'tab is selected',
            tab: tabs.a,
            pathname: '/a',
            basePath: '/',
            tabs: tabsArray,
            expected: true
        },
        {
            name: 'tab is not selected',
            tab: tabs.b,
            pathname: '/a',
            basePath: '/',
            tabs: tabsArray,
            expected: false
        },
        {
            name: 'tab with children is selected',
            tab: tabs.c,
            pathname: '/c/id',
            basePath: '/',
            tabs: tabsArray,
            expected: true
        },
        {
            name: 'tab is selected despite trailing slash',
            tab: tabs.b,
            pathname: '/b/',
            basePath: '/',
            tabs: tabsArray,
            expected: true
        }
    ];

    tests.forEach((test) => {
        it(test.name, () => {
            expect(isTabSelected(test.tab, test.pathname, test.basePath, test.tabs)).toBe(
                test.expected
            );
        });
    });
});
