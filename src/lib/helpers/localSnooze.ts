/**
 * Browser-local mirror of the account-prefs snooze in `notifications.ts`.
 *
 * Account prefs are the source of truth: they carry the hide count and follow the user across
 * devices. This only covers a rejected prefs write, where the dismissal would otherwise be lost
 * on the next load. It deliberately reproduces the same escalation, so intermittent failures
 * continue the sequence instead of restarting it at the base period every time.
 */

const COOL_OFF_MS = 3600000;

export type LocalSnooze = {
    /** How many times this has been snoozed locally. */
    hideCount: number;
    /** Epoch ms after which the notification may show again. */
    expiry: number;
};

export function nextLocalSnooze(
    previous: LocalSnooze | null,
    coolOffPeriodHours: number,
    now: number,
    backoffFactor = 2
): LocalSnooze {
    const hideCount = (previous?.hideCount ?? 0) + 1;

    return {
        hideCount,
        expiry: now + coolOffPeriodHours * COOL_OFF_MS * backoffFactor ** (hideCount - 1)
    };
}

export function isLocallySnoozed(snooze: LocalSnooze | null, now: number): boolean {
    return !!snooze && Number.isFinite(snooze.expiry) && now < snooze.expiry;
}

export function readLocalSnooze(key: string): LocalSnooze | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as LocalSnooze;
        return Number.isFinite(parsed?.expiry) ? parsed : null;
    } catch {
        // A malformed or unreadable value must not keep the notification hidden forever.
        return null;
    }
}

export function writeLocalSnooze(key: string, snooze: LocalSnooze) {
    try {
        localStorage.setItem(key, JSON.stringify(snooze));
    } catch {
        // Storage can be unavailable in private mode. Nothing to recover here: the notification
        // reappears on the next load, which is the safer direction to fail.
    }
}

export function clearLocalSnooze(key: string) {
    try {
        localStorage.removeItem(key);
    } catch {
        // See writeLocalSnooze.
    }
}
