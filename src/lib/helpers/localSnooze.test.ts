import { describe, expect, it } from 'vitest';
import { isLocallySnoozed, nextLocalSnooze, type LocalSnooze } from './localSnooze';

const HOUR = 3600000;
const WEEK_HOURS = 24 * 7;
const NOW = 1_700_000_000_000;

describe('nextLocalSnooze', () => {
    it('starts at the base cool-off', () => {
        const snooze = nextLocalSnooze(null, WEEK_HOURS, NOW);

        expect(snooze.hideCount).toBe(1);
        expect(snooze.expiry).toBe(NOW + WEEK_HOURS * HOUR);
    });

    // The point of the fallback: a run of failed preference writes has to keep escalating,
    // otherwise the user is asked again every week forever.
    it('doubles on each repeat instead of restarting at the base period', () => {
        let snooze: LocalSnooze | null = null;
        const weeks: number[] = [];

        for (let i = 0; i < 4; i++) {
            snooze = nextLocalSnooze(snooze, WEEK_HOURS, NOW);
            weeks.push((snooze.expiry - NOW) / (WEEK_HOURS * HOUR));
        }

        expect(weeks).toEqual([1, 2, 4, 8]);
        expect(snooze?.hideCount).toBe(4);
    });

    it('matches the account-prefs formula, coolOff * factor ** (hideCount - 1)', () => {
        const third = nextLocalSnooze({ hideCount: 2, expiry: 0 }, WEEK_HOURS, NOW);

        expect(third.expiry).toBe(NOW + WEEK_HOURS * HOUR * 2 ** 2);
    });
});

describe('isLocallySnoozed', () => {
    it('holds until the deadline, then releases', () => {
        const snooze = nextLocalSnooze(null, WEEK_HOURS, NOW);

        expect(isLocallySnoozed(snooze, NOW)).toBe(true);
        expect(isLocallySnoozed(snooze, snooze.expiry - 1)).toBe(true);
        expect(isLocallySnoozed(snooze, snooze.expiry)).toBe(false);
    });

    it('never hides the notification for a missing or corrupt value', () => {
        expect(isLocallySnoozed(null, NOW)).toBe(false);
        expect(isLocallySnoozed({ hideCount: 1, expiry: NaN }, NOW)).toBe(false);
    });
});
