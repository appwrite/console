import { getProjectId } from '$lib/helpers/project';
import { vi } from 'vitest';

test('getProjectId', () => {
    const tests: Array<{
        pathname: string;
        expected: string | null;
    }> = [
        {
            pathname: '/console/project-6374e9031588b25d1841/databases',
            expected: '6374e9031588b25d1841'
        },
        {
            pathname: '/console/project-/databases',
            expected: null
        },
        {
            pathname: '/console/project-project-project-abc/databases',
            expected: 'project-project-abc'
        },
        {
            pathname: '/console/project-abc/databases',
            expected: 'abc'
        },
        {
            pathname: '/console/project-abc/databases/project-123',
            expected: 'abc'
        },
        {
            pathname: '/console/project-abc/databases/project-123/project-456',
            expected: 'abc'
        },

        {
            pathname: '/console',
            expected: null
        }
    ];

    for (const { pathname, expected } of tests) {
        vi.stubGlobal('location', {
            ...window.location,
            pathname
        });
        expect(getProjectId()).toBe(expected);
    }
});
