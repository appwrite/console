import { browser } from '$app/environment';
import { growthEndpoint } from '$lib/constants';
import { writable } from 'svelte/store';

export type AppStore = {
    theme: 'light' | 'dark' | 'auto';
    themeInUse: 'light' | 'dark';
};

export type Feedback = {
    elapsed: number;
    visualized: number;
    notification: boolean;
    type: 'nps' | 'general';
};

export const app = writable<AppStore>({
    theme: 'auto',
    themeInUse: 'light'
});

function createFeedbackStore() {
    const localElapsed = parseInt(localStorage.getItem('feedbackElapsed') ?? '0');
    const localVisualized = parseInt(localStorage.getItem('feedbackVisualized') ?? '0');

    const { subscribe, update } = writable<Feedback>({
        elapsed: browser ? localElapsed : 0,
        visualized: browser ? localVisualized : 0,
        notification: false,
        type: 'general'
    });
    return {
        subscribe,
        update,
        toggleNotification: () =>
            update((feedback) => {
                feedback.notification = !feedback.notification;
                return feedback;
            }),
        switchType: (feedType: 'nps' | 'general') =>
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
            const response = await fetch(`${growthEndpoint}/feedback`, {
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
            if (response.status !== 200) {
                throw new Error('Failed to submit feedback');
            }
        }
    };
}
export const feedback = createFeedbackStore();

if (browser) {
    const localAppwrite = JSON.parse(localStorage.getItem('appwrite') ?? '{}');

    app.update((n) => ({
        ...n,
        ...(localAppwrite ?? {})
    }));
    app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}
