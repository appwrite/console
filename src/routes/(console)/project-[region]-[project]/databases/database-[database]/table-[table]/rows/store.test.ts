import { describe, expect, it } from 'vitest';
import { toLocalDateTimeISO } from '$lib/helpers/date';
import { buildPayload } from './store';
import type { Field } from '$database/(entity)';

describe('buildPayload', () => {
    it('converts local datetime-local strings to UTC ISO for datetime fields', () => {
        const utc = '2026-01-01T00:00:00.000Z';
        const local = toLocalDateTimeISO(utc);
        const fields = [{ key: 'startAt', type: 'datetime' }] as Field[];

        const payload = buildPayload(fields, { startAt: local, name: 'unchanged' });

        expect(payload.startAt).toBe(new Date(local).toISOString());
        expect(payload.name).toBe('unchanged');
    });

    it('round-trips an unchanged datetime through local display encoding', () => {
        const utc = '2026-01-01T00:00:00.000Z';
        const fields = [{ key: 'startAt', type: 'datetime' }] as Field[];

        const payload = buildPayload(fields, { startAt: toLocalDateTimeISO(utc) });

        expect(payload.startAt).toBe(new Date(utc).toISOString());
    });

    it('converts datetime arrays element-wise', () => {
        const utc = '2026-01-01T00:00:00.000Z';
        const local = toLocalDateTimeISO(utc);
        const fields = [{ key: 'times', type: 'datetime', array: true }] as Field[];

        const payload = buildPayload(fields, { times: [local, null] });

        expect(payload.times).toEqual([new Date(local).toISOString(), null]);
    });

    it('leaves null and empty datetime values alone', () => {
        const fields = [{ key: 'startAt', type: 'datetime' }] as Field[];

        expect(buildPayload(fields, { startAt: null }).startAt).toBeNull();
        expect(buildPayload(fields, { startAt: '' }).startAt).toBe('');
    });

    it('still stringifies bigint fields', () => {
        const fields = [{ key: 'count', type: 'bigint' }] as Field[];

        expect(buildPayload(fields, { count: 42n }).count).toBe('42');
    });
});
