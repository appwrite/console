import { trimLeadingDisabledSpecifications } from '$lib/helpers/specifications';
import type { Models } from '@appwrite.io/console';
import { describe, expect, it } from 'vitest';

const specification = (slug: string, enabled: boolean): Models.Specification => ({
    slug,
    enabled,
    cpus: 1,
    memory: 512
});

describe('trimLeadingDisabledSpecifications', () => {
    it('hides disabled specifications before the first enabled specification', () => {
        const list = {
            total: 4,
            specifications: [
                specification('disabled-small', false),
                specification('enabled-small', true),
                specification('enabled-large', true),
                specification('disabled-large', false)
            ]
        };

        expect(trimLeadingDisabledSpecifications(list)).toEqual({
            total: 3,
            specifications: list.specifications.slice(1)
        });
        expect(list.specifications).toHaveLength(4);
    });

    it('keeps the list unchanged when the first specification is enabled', () => {
        const list = {
            total: 2,
            specifications: [specification('enabled', true), specification('disabled', false)]
        };

        expect(trimLeadingDisabledSpecifications(list)).toEqual(list);
    });

    it('returns an empty list when no specification is enabled', () => {
        const list = {
            total: 2,
            specifications: [
                specification('disabled-small', false),
                specification('disabled-large', false)
            ]
        };

        expect(trimLeadingDisabledSpecifications(list)).toEqual({
            total: 0,
            specifications: []
        });
    });

    it('keeps an empty list empty', () => {
        expect(trimLeadingDisabledSpecifications({ total: 0, specifications: [] })).toEqual({
            total: 0,
            specifications: []
        });
    });
});
