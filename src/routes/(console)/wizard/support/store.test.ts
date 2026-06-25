import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { isSupportOnline } from './store';

describe('isSupportOnline', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // day: 0=Sun, 1=Mon, ..., 6=Sat
    const mockDate = (hour: number, day: number) => {
        // Find a real date that matches the desired UTC day and hour
        const base = new Date('2024-01-01T00:00:00Z'); // Monday
        const daysToAdd = (day - base.getUTCDay() + 7) % 7;
        const date = new Date(base);
        date.setUTCDate(base.getUTCDate() + daysToAdd);
        date.setUTCHours(hour, 0, 0, 0);
        vi.setSystemTime(date);
    };

    describe('weekday support hours (Monday-Friday)', () => {
        it('should be online at 04:00 UTC (Monday)', () => {
            mockDate(4, 1); // Monday, 04:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 10:00 UTC (Tuesday)', () => {
            mockDate(10, 2); // Tuesday, 10:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 16:59 UTC (Wednesday)', () => {
            mockDate(16, 3); // Wednesday, 16:59 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 12:00 UTC (Thursday)', () => {
            mockDate(12, 4); // Thursday, 12:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 08:00 UTC (Friday)', () => {
            mockDate(8, 5); // Friday, 08:00 UTC
            expect(isSupportOnline()).toBe(true);
        });
    });

    describe('outside support hours on weekdays', () => {
        it('should be offline at 03:59 UTC (Monday)', () => {
            mockDate(3, 1); // Monday, 03:59 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline at 00:00 UTC (Tuesday)', () => {
            mockDate(0, 2); // Tuesday, 00:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline at 17:00 UTC (Wednesday)', () => {
            mockDate(17, 3); // Wednesday, 17:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline at 23:00 UTC (Friday)', () => {
            mockDate(23, 5); // Friday, 23:00 UTC
            expect(isSupportOnline()).toBe(false);
        });
    });

    describe('weekends', () => {
        it('should be offline on Saturday regardless of hour', () => {
            mockDate(10, 6); // Saturday, 10:00 UTC (in support hours for weekdays)
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline on Sunday regardless of hour', () => {
            mockDate(0, 0); // Sunday, 00:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline on Saturday at midnight', () => {
            mockDate(0, 6); // Saturday, 00:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline on Sunday at 10:00', () => {
            mockDate(10, 0); // Sunday, 10:00 UTC
            expect(isSupportOnline()).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle boundary at 03:59 (just before support hours)', () => {
            mockDate(3, 1); // Monday, 03:59 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should handle boundary at 04:00 (start of support hours)', () => {
            mockDate(4, 1); // Monday, 04:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should handle boundary at 17:00 (end of support hours)', () => {
            mockDate(17, 1); // Monday, 17:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should handle boundary at 16:59 (just before end of support hours)', () => {
            mockDate(16, 5); // Friday, 16:59 UTC
            expect(isSupportOnline()).toBe(true);
        });
    });
});
