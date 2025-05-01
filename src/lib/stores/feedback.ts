import { browser } from '$app/environment';
import { VARS } from '$lib/system';
import { get, writable } from 'svelte/store';
import type { Component } from 'svelte';
import FeedbackGeneral from '$lib/components/feedback/feedbackGeneral.svelte';
import FeedbackNps from '$lib/components/feedback/feedbackNPS.svelte';
import { Submit, trackEvent } from '$lib/actions/analytics';

export type Feedback = {
    elapsed: number;
    visualized: number;
    notification: boolean;
    type: 'nps' | 'general';
    show: boolean;
    source: string;
};

export type FeedbackData = {
    message: string;
    value?: number;
};

export type FeedbackOption = {
    type: Feedback['type'];
    desc?: string;
    component: Component;
};

export const feedbackOptions: FeedbackOption[] = [
    {
        type: 'general',
        desc: 'Appwrite evolves with your input. Share your thoughts and help us improve Appwrite.',
        component: FeedbackGeneral
    },
    {
        type: 'nps',
        desc: 'How likely are you to recommend Appwrite to a friend or colleague?',
        component: FeedbackNps
    }
];

export const selectedFeedback = writable<FeedbackOption>();

function createFeedbackDataStore() {
    const { set, subscribe, update } = writable<FeedbackData>({
        message: '',
        value: null
    });
    return {
        set,
        subscribe,
        update,
        reset: () => {
            update((feedbackData) => {
                feedbackData.message = '';
                feedbackData.value = null;
                return feedbackData;
            });
        }
    };
}

export const feedbackData = createFeedbackDataStore();

function createFeedbackStore() {
    const { subscribe, update } = writable<Feedback>({
        elapsed: browser ? (parseInt(localStorage.getItem('feedbackElapsed')) ?? 0) : 0,
        visualized: browser ? (parseInt(localStorage.getItem('feedbackVisualized')) ?? 0) : 0,
        notification: false,
        type: 'general',
        show: false,
        source: 'n/a'
    });
    return {
        subscribe,
        update,
        toggleFeedback: (source: string = 'n/a') => {
            update((feedback) => {
                feedback.source = source;
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
        // TODO: update growth server to accept `billingPlan`.
        // TODO: update growth server to accept `source` key to know the feedback source area.
        submitFeedback: async (
            subject: string,
            message: string,
            currentPage: string,
            name?: string,
            email?: string,
            // eslint-disable-next-line
            billingPlan?: string,
            value?: number,
            orgId?: string,
            projectId?: string,
            userId?: string
        ) => {
            if (!VARS.GROWTH_ENDPOINT) return;
            trackEvent(Submit.FeedbackSubmit);

            const customFields: Array<{ id: string; value: string | number }> = [
                { id: '47364', value: currentPage }
            ];

            if (value) {
                customFields.push({ id: '40655', value });
            }

            if (billingPlan) {
                customFields.push({ id: '56109', value: billingPlan });
            }

            const response = await fetch(`${VARS.GROWTH_ENDPOINT}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject,
                    message,
                    email,
                    customFields,
                    firstname: name || 'Unknown',
                    metaFields: {
                        source: get(feedback).source,
                        orgId,
                        projectId,
                        userId
                    }
                })
            });

            // reset the state
            get(feedback).source = 'n/a';

            if (response.status >= 400) {
                throw new Error('Failed to submit feedback');
            }
        }
    };
}

export const feedback = createFeedbackStore();
