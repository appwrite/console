import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import AiSuggestionsDark from '$lib/images/promos/ai-suggestions-dark.png';
import AiSuggestionsLight from '$lib/images/promos/ai-suggestions-light.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const aiSuggestionsPromo: BottomModalAlertItem = {
        id: 'modal:database_ai_suggestions_announcement',
        src: {
            dark: AiSuggestionsDark,
            light: AiSuggestionsLight
        },
        title: 'Announcing Database AI suggestions',
        message: 'From table name to schema in one click.',
        plan: 'free',
        importance: 8,
        scope: 'project',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-database-ai-suggestions',
            external: true,
            hideOnClick: true
        },
        show: true
    };
    listOfPromotions.push(aiSuggestionsPromo);
}

export function addBottomModalAlerts() {
    listOfPromotions.forEach((promotion) => showBottomModalAlert(promotion));
}

// use this for time based promo handling
// noinspection JSUnusedGlobalSymbols
export function isPromoLive(
    date: string,
    time: string,
    timeZone: string = 'Europe/Paris'
): boolean {
    const now = new Date();
    const targetString = `${date}T${time}:00`;
    const target = new Date(new Date(targetString).toLocaleString('en-US', { timeZone }));

    return isSameDay(now, target) && now >= target;
}
