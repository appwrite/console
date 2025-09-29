import { describe, expect, it, beforeEach, vi } from 'vitest';
import { isSupportOnline } from './store';

describe('isSupportOnline', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // Helper function to create a mock date
    const mockDate = (year: number, month: number, date: number, hour: number, day: number) => {
        const mockDate = new Date();
        vi.spyOn(mockDate, 'getUTCDay').mockReturnValue(day);
        vi.spyOn(mockDate, 'getUTCHours').mockReturnValue(hour);
        vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
        return mockDate;
    };

    describe('weekday support hours (Monday-Friday)', () => {
        it('should be online at 16:00 UTC (Monday)', () => {
            mockDate(2024, 0, 15, 16, 1); // Monday, 16:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 20:00 UTC (Tuesday)', () => {
            mockDate(2024, 0, 16, 20, 2); // Tuesday, 20:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 23:59 UTC (Wednesday)', () => {
            mockDate(2024, 0, 17, 23, 3); // Wednesday, 23:59 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 23:00 UTC (Thursday)', () => {
            mockDate(2024, 0, 18, 23, 4); // Thursday, 23:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should be online at 22:00 UTC (Friday)', () => {
            mockDate(2024, 0, 19, 22, 5); // Friday, 22:00 UTC
            expect(isSupportOnline()).toBe(true);
        });
    });

    describe('outside support hours on weekdays', () => {
        it('should be offline at 15:59 UTC (Monday)', () => {
            mockDate(2024, 0, 15, 15, 1); // Monday, 15:59 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline at 00:00 UTC (Tuesday)', () => {
            mockDate(2024, 0, 16, 0, 2); // Tuesday, 00:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline at 10:00 UTC (Wednesday)', () => {
            mockDate(2024, 0, 17, 10, 3); // Wednesday, 10:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline at 14:00 UTC (Friday)', () => {
            mockDate(2024, 0, 19, 14, 5); // Friday, 14:00 UTC
            expect(isSupportOnline()).toBe(false);
        });
    });

    describe('weekends', () => {
        it('should be offline on Saturday regardless of hour', () => {
            mockDate(2024, 0, 20, 18, 6); // Saturday, 18:00 UTC (in support hours for weekdays)
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline on Sunday regardless of hour', () => {
            mockDate(2024, 0, 21, 0, 0); // Sunday, 00:00 UTC (in support hours for weekdays)
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline on Saturday at midnight', () => {
            mockDate(2024, 0, 20, 0, 6); // Saturday, 00:00 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should be offline on Sunday at 16:00', () => {
            mockDate(2024, 0, 21, 16, 0); // Sunday, 16:00 UTC
            expect(isSupportOnline()).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle boundary at 15:59 (just before support hours)', () => {
            mockDate(2024, 0, 15, 15, 1); // Monday, 15:59 UTC
            expect(isSupportOnline()).toBe(false);
        });

        it('should handle boundary at 16:00 (start of support hours)', () => {
            mockDate(2024, 0, 15, 16, 1); // Monday, 16:00 UTC
            expect(isSupportOnline()).toBe(true);
        });

        it('should handle late night hours on Friday', () => {
            mockDate(2024, 0, 19, 23, 5); // Friday, 23:00 UTC
            expect(isSupportOnline()).toBe(true);
        });
    });
});