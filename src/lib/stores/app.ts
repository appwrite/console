import { browser } from '$app/environment';
import { VARS } from '$lib/system';
import { get, writable } from 'svelte/store';

export type AppStore = {
    theme: 'light' | 'dark' | 'auto';
    themeInUse: 'light' | 'dark';
};

export type Feedback = {
    elapsed: number;
    visualized: number;
    notification: boolean;
    type: 'nps' | 'general';
    show: boolean;
};

export enum Tier {
    FREE = 'free',
    PRO = 'pro',
    ENTERPRISE = 'enterprise'
}

export const app = writable<AppStore>({
    theme: 'auto',
    themeInUse: 'light'
});

//TODO: once billing is enabled on organization load/update, update the tier
export const tier = writable<Tier>(Tier.FREE);
export const isFreeTier = get(tier) === Tier.FREE;
export const isPaidTier = get(tier) === Tier.PRO || get(tier) === Tier.ENTERPRISE;

function createFeedbackStore() {
    const { subscribe, update } = writable<Feedback>({
        elapsed: browser ? parseInt(localStorage.getItem('feedbackElapsed')) : 0,
        visualized: browser ? parseInt(localStorage.getItem('feedbackVisualized')) : 0,
        notification: false,
        type: 'general',
        show: false
    });
    return {
        subscribe,
        update,
        toggleFeedback: () => {
            update((feedback) => {
                feedback.show = !feedback.show;
                return feedback;
            });
        },
        toggleNotification: () =>
            update((feedback) => {
                feedback.notification = !feedback.notification;
                return feedback;
            }),
        switchType: (feedType: Feedback['type']) =>
            update((feedback) => {
                feedback.type = feedType;
                return feedback;
            }),
        addVisualization: () =>
            update((feedback) => {
                feedback.visualized += 1;
                localStorage.setItem('feedbackVisualized', feedback.visualized.toString());
                return feedback;
            }),

        increaseElapsed: (time: number) => {
            update((feedback) => {
                feedback.elapsed += time;
                localStorage.setItem('feedbackElapsed', feedback.elapsed.toString());
                return feedback;
            });
        },
        submitFeedback: async (
            subject: string,
            message: string,
            firstname?: string,
            email?: string,
            value?: number
        ) => {
            if (!VARS.GROWTH_ENDPOINT) return;
            const response = await fetch(`${VARS.GROWTH_ENDPOINT}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject,
                    message,
                    email,
                    firstname: firstname ? firstname : undefined,
                    customFields: value ? [{ id: '40655', value }] : undefined
                })
            });
            if (response.status >= 400) {
                throw new Error('Failed to submit feedback');
            }
        }
    };
}
export const feedback = createFeedbackStore();

if (browser) {
    app.update((n) => ({
        ...n,
        ...(JSON.parse(localStorage.getItem('appwrite')) ?? {})
    }));
    app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}
