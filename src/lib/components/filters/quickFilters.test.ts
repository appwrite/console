import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addFilterAndApply, addStatusCodeFilter } from './quickFilters';
import { queries, ValidOperators } from './store';
import type { Column } from '$lib/helpers/types';

// Mock the store functions
vi.mock('./store', () => ({
    queries: {
        removeFilter: vi.fn(),
        apply: vi.fn()
    },
    tags: {
        subscribe: vi.fn(() => vi.fn())
    },
    addFilter: vi.fn(),
    ValidOperators: {
        Equal: 'equal',
        LessThanOrEqual: 'lessThanOrEqual',
        GreaterThanOrEqual: 'greaterThanOrEqual',
        GreaterThan: 'greaterThan'
    }
}));

// Mock analytics
vi.mock('$lib/actions/analytics', () => ({
    trackEvent: vi.fn(),
    Submit: {
        ApplyQuickFilter: 'apply_quick_filter'
    }
}));

// Mock svelte/store
vi.mock('svelte/store', () => ({
    get: vi.fn(() => [])
}));

describe('quickFilters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('addFilterAndApply', () => {
        const mockColumns: Column[] = [
            {
                id: 'responseStatusCode',
                title: 'Status code',
                type: 'integer',
                elements: [
                    { value: 299, label: 'Success (200-299)' },
                    { value: 399, label: 'Redirect (300-399)' },
                    { value: 499, label: 'Client error (400-499)' },
                    { value: 599, label: 'Server error (500-599)' }
                ]
            }
        ];

        it('should handle responseStatusCode column correctly', async () => {
            const { addFilter } = await import('./store');
            
            addFilterAndApply(
                'responseStatusCode',
                'Status code',
                ValidOperators.Equal,
                '299',
                [],
                mockColumns,
                'test-source'
            );

            // Should call addFilter twice with range operators, not once with equal
            expect(addFilter).toHaveBeenCalledTimes(2);
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.LessThanOrEqual,
                299
            );
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.GreaterThanOrEqual,
                200
            );
            expect(queries.apply).toHaveBeenCalledTimes(1);
        });

        it('should handle status code with different casing', async () => {
            const { addFilter } = await import('./store');
            
            addFilterAndApply(
                'ResponseStatusCode',
                'Status code',
                ValidOperators.Equal,
                '499',
                [],
                mockColumns,
                'test-source'
            );

            expect(addFilter).toHaveBeenCalledTimes(2);
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'ResponseStatusCode',
                ValidOperators.LessThanOrEqual,
                499
            );
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'ResponseStatusCode',
                ValidOperators.GreaterThanOrEqual,
                400
            );
        });

        it('should handle statusCode column name', async () => {
            const { addFilter } = await import('./store');
            
            addFilterAndApply(
                'statusCode',
                'Status code',
                ValidOperators.Equal,
                '399',
                [],
                mockColumns,
                'test-source'
            );

            expect(addFilter).toHaveBeenCalledTimes(2);
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'statusCode',
                ValidOperators.LessThanOrEqual,
                399
            );
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'statusCode',
                ValidOperators.GreaterThanOrEqual,
                300
            );
        });
    });

    describe('addStatusCodeFilter', () => {
        const mockColumns: Column[] = [];

        it('should create range filters for status code 299', async () => {
            const { addFilter } = await import('./store');
            
            addStatusCodeFilter('299', 'responseStatusCode', mockColumns);

            expect(addFilter).toHaveBeenCalledTimes(2);
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.LessThanOrEqual,
                299
            );
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.GreaterThanOrEqual,
                200
            );
        });

        it('should create range filters for status code 499', async () => {
            const { addFilter } = await import('./store');
            
            addStatusCodeFilter('499', 'responseStatusCode', mockColumns);

            expect(addFilter).toHaveBeenCalledTimes(2);
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.LessThanOrEqual,
                499
            );
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.GreaterThanOrEqual,
                400
            );
        });

        it('should create range filters for status code 599', async () => {
            const { addFilter } = await import('./store');
            
            addStatusCodeFilter('599', 'responseStatusCode', mockColumns);

            expect(addFilter).toHaveBeenCalledTimes(2);
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.LessThanOrEqual,
                599
            );
            expect(addFilter).toHaveBeenCalledWith(
                mockColumns,
                'responseStatusCode',
                ValidOperators.GreaterThanOrEqual,
                500
            );
        });
    });
});
