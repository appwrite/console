import { browser } from '$app/environment';
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
    const { subscribe, update } = writable<Feedback>({
        elapsed: browser ? parseInt(localStorage.getItem('feedbackElapsed')) : 0,
        visualized: browser ? parseInt(localStorage.getItem('feedbackVisualized')) : 0,
        notification: false,
        type: 'nps'
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
            subject?: string,
            email?: string,
            message?: string,
            tags?: string[],
            customFields?: Record<string, unknown>[]
        ) => {
            const response = await fetch('https://growth.appwrite.io/v1/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject,
                    email,
                    message,
                    tags,
                    customFields
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
    app.update((n) => ({
        ...n,
        ...(JSON.parse(localStorage.getItem('appwrite')) ?? {})
    }));
    app.subscribe((u) => localStorage.setItem('appwrite', JSON.stringify(u) ?? '{}'));
}
