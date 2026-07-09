import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import StateOfAppwriteSurvey from '$lib/images/promos/state-of-appwrite-survey.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const stateOfAppwriteSurveyPromo: BottomModalAlertItem = {
        id: 'modal:state_of_appwrite_survey_announcement',
        src: {
            dark: StateOfAppwriteSurvey,
            light: StateOfAppwriteSurvey
        },
        title: 'State of Appwrite Cloud',
        message:
            'Help us shape the future of Appwrite Cloud by sharing your experience, AI stack, and usage preferences. Your feedback is vital!',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Take the survey',
            link: () => 'https://forms.gle/5cvWxTwhonoDCWsi7',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(stateOfAppwriteSurveyPromo);
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
