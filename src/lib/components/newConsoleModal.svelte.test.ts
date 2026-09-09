import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { page } from '$app/state';
import { trackEvent } from '$lib/actions/analytics';
import { sdk } from '$lib/stores/sdk';
import { user, type Account } from '$lib/stores/user';
import type { Writable } from 'svelte/store';
import NewConsoleModal from './newConsoleModal.svelte';

vi.mock('$lib/actions/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('$lib/stores/sdk', () => ({
    sdk: { forConsole: { account: { updatePrefs: vi.fn().mockResolvedValue({}) } } }
}));
vi.mock('$lib/stores/user', async () => {
    const { writable } = await import('svelte/store');
    return { user: writable(null) };
});
vi.mock('$lib/commandCenter', async () => {
    const { readable } = await import('svelte/store');
    return { disableCommands: readable(vi.fn()) };
});
vi.mock('$app/state', async () => {
    const { fromStore, writable } = await import('svelte/store');
    const url = fromStore(writable(new URL('https://cloud.appwrite.io/console')));

    return {
        page: {
            get url() {
                return url.current;
            },
            set url(value) {
                url.current = value;
            }
        }
    };
});
const now = Date.UTC(2026, 8, 9);
const coolOff = 30 * 24 * 60 * 60 * 1000;
const showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
});
const closeDialog = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
});

function setAccount(notificationPrefs = {}) {
    (user as Writable<Account>).set({
        prefs: { theme: 'dark', notificationPrefs }
    } as unknown as Account);
}

function navigate(path: string) {
    return act(() => {
        Object.assign(page, { url: new URL(path, 'https://cloud.appwrite.io') });
    });
}

function expectSnoozed(action: 'continue' | 'try') {
    expect(sdk.forConsole.account.updatePrefs).toHaveBeenCalledExactlyOnceWith({
        prefs: {
            theme: 'dark',
            notificationPrefs: {
                newConsoleModal: { expiry: now + coolOff, hideCount: 1, state: 'hidden' }
            }
        }
    });
    expect(trackEvent).toHaveBeenCalledWith('close_new_console_modal', {
        source: 'new_console_modal',
        action
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(closeDialog).toHaveBeenCalledOnce();
}

describe('new Console modal', () => {
    beforeAll(() => {
        // jsdom has no dialog API. These shims only expose open/closed state; native focus
        // containment, restoration, and Escape delivery require a real browser.
        Object.defineProperties(HTMLDialogElement.prototype, {
            showModal: { configurable: true, value: showModal },
            close: { configurable: true, value: closeDialog }
        });
    });

    beforeEach(async () => {
        vi.spyOn(Date, 'now').mockReturnValue(now);
        setAccount();
        await navigate('/console');
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    afterAll(() => {
        delete HTMLDialogElement.prototype.showModal;
        delete HTMLDialogElement.prototype.close;
    });

    it('does not write preferences or analytics when mounted hidden', () => {
        render(NewConsoleModal);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(showModal).not.toHaveBeenCalled();
        expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();
        expect(trackEvent).not.toHaveBeenCalled();
    });

    it('opens an accessible modal without snoozing it', () => {
        render(NewConsoleModal, { show: true });

        expect(screen.getByRole('dialog', { name: 'The new Appwrite Console' })).toHaveAttribute(
            'open'
        );
        expect(showModal).toHaveBeenCalledOnce();
        expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();
        expect(trackEvent).not.toHaveBeenCalled();
    });

    it.each(['Close', 'Stay here for now'])('snoozes once when clicking %s', async (name) => {
        render(NewConsoleModal, { show: true });

        await fireEvent.click(screen.getByRole('button', { name }));

        expectSnoozed('continue');
        expect(trackEvent).toHaveBeenCalledOnce();
    });

    it('snoozes once when Escape requests cancellation', async () => {
        render(NewConsoleModal, { show: true });
        const cancel = new Event('cancel', { cancelable: true });

        await fireEvent(screen.getByRole('dialog'), cancel);

        expect(cancel.defaultPrevented).toBe(true);
        expectSnoozed('continue');
        expect(trackEvent).toHaveBeenCalledOnce();
    });

    it('keeps Escape from reaching background keyboard handlers without preventing cancellation', async () => {
        const backgroundKeydown = vi.fn();
        window.addEventListener('keydown', backgroundKeydown);
        render(NewConsoleModal, { show: true });
        const escape = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true
        });

        try {
            await fireEvent(screen.getByRole('button', { name: 'Close' }), escape);

            expect(backgroundKeydown).not.toHaveBeenCalled();
            expect(escape.defaultPrevented).toBe(false);
            expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();
        } finally {
            window.removeEventListener('keydown', backgroundKeydown);
        }
    });

    it('restores focus to the previously focused control when dismissed', async () => {
        const previous = document.createElement('button');
        document.body.append(previous);
        previous.focus();
        render(NewConsoleModal, { show: true });
        const dismiss = screen.getByRole('button', { name: 'Close' });
        dismiss.focus();

        try {
            await fireEvent.click(dismiss);

            expect(previous).toHaveFocus();
        } finally {
            previous.remove();
        }
    });

    it('snoozes on a backdrop click but ignores clicks within the dialog content', async () => {
        render(NewConsoleModal, { show: true });
        await fireEvent.click(screen.getByRole('heading', { name: 'The new Appwrite Console' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();

        await fireEvent.click(screen.getByRole('dialog'));

        expectSnoozed('continue');
        expect(trackEvent).toHaveBeenCalledOnce();
    });

    it('tracks the new Console link and snoozes once when following it', async () => {
        render(NewConsoleModal, { show: true });
        const link = screen.getByRole('link', { name: 'Take me to the new Console' });
        expect(link).toHaveAttribute(
            'href',
            'https://appwrite.io/?utm_source=old-console&utm_medium=modal&utm_campaign=new-console'
        );
        expect(link).toHaveAttribute('target', '_blank');

        await fireEvent.click(link);

        expectSnoozed('try');
        expect(trackEvent).toHaveBeenCalledWith('click_new_console', {
            source: 'new_console_modal'
        });
        expect(trackEvent).toHaveBeenCalledTimes(2);
    });

    it('does not double the snooze when two dismissal events arrive together', async () => {
        render(NewConsoleModal, { show: true });
        const dialog = screen.getByRole('dialog');
        const dismiss = screen.getByRole('button', { name: 'Close' });

        await act(() => {
            dismiss.click();
            dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
        });

        expectSnoozed('continue');
        expect(trackEvent).toHaveBeenCalledOnce();
    });

    it('doubles the existing cool-off while preserving unrelated preferences', async () => {
        const bannerPref = { expiry: now + 1000, hideCount: 1, state: 'hidden' };
        setAccount({
            newConsoleModal: { expiry: now - 1, hideCount: 2, state: 'shown' },
            newConsoleBanner: bannerPref
        });
        render(NewConsoleModal, { show: true });

        await fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(sdk.forConsole.account.updatePrefs).toHaveBeenCalledExactlyOnceWith({
            prefs: {
                theme: 'dark',
                notificationPrefs: {
                    newConsoleModal: { expiry: now + coolOff * 4, hideCount: 3, state: 'hidden' },
                    newConsoleBanner: bannerPref
                }
            }
        });
    });

    it('closes silently when the parent hides it and can be shown again', async () => {
        const { rerender } = render(NewConsoleModal, { show: true });

        await rerender({ show: false });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(closeDialog).toHaveBeenCalledOnce();
        expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();
        expect(trackEvent).not.toHaveBeenCalled();

        await rerender({ show: true });

        expect(screen.getByRole('dialog')).toHaveAttribute('open');
        expect(showModal).toHaveBeenCalledTimes(2);
    });

    it.each(['/console/onboarding', '/console/onboarding/create-organization'])(
        'stays hidden on initial onboarding route %s, then opens after leaving',
        async (path) => {
            await navigate(path);
            render(NewConsoleModal, { show: true });

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(showModal).not.toHaveBeenCalled();
            expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();

            await navigate('/console/organization-example');

            expect(screen.getByRole('dialog')).toHaveAttribute('open');
            expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();
            expect(trackEvent).not.toHaveBeenCalled();
        }
    );

    it('closes without snoozing when navigating into onboarding', async () => {
        render(NewConsoleModal, { show: true });

        await navigate('/console/onboarding');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(closeDialog).toHaveBeenCalledOnce();
        expect(sdk.forConsole.account.updatePrefs).not.toHaveBeenCalled();
        expect(trackEvent).not.toHaveBeenCalled();
    });
});
