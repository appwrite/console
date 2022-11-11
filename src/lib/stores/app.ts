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
        elapsed: parseInt(localStorage.getItem('feedbackElapsed') ?? '0'),
        visualized: parseInt(localStorage.getItem('feedbackVisualized') ?? '0'),
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
        switchType: () =>
            update((feedback) => {
                feedback.type = feedback.type === 'nps' ? 'general' : 'nps';
                return feedback;
            }),
        addVisualization: () =>
            update((feedback) => {
                localStorage.setItem('feedbackVisualized', (feedback.visualized + 1).toString());
                feedback.visualized = feedback.visualized + 1;
                return feedback;
            }),

        setElapsed: (time: number) => {
            update((feedback) => {
                localStorage.setItem('feedbackElapsed', time.toString());
                feedback.elapsed = time;
                return feedback;
            });
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
