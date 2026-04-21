import { isCloud } from '$lib/system';
import { isSameDay } from '$lib/helpers/date';
import { type BottomModalAlertItem, showBottomModalAlert } from '$lib/stores/bottom-alerts';
import ClaudeCodePlugin from '$lib/images/promos/claude-code-plugin.png';

const listOfPromotions: BottomModalAlertItem[] = [];

if (isCloud) {
    const claudePluginPromo: BottomModalAlertItem = {
        id: 'modal:claude_plugin_announcement',
        src: {
            dark: ClaudeCodePlugin,
            light: ClaudeCodePlugin
        },
        title: 'Announcing the Appwrite Claude plugin',
        message: 'Build, manage, and ship Appwrite projects without leaving Claude Code.',
        plan: 'free',
        importance: 8,
        scope: 'everywhere',
        cta: {
            text: 'Read announcement',
            link: () => 'https://appwrite.io/blog/post/announcing-appwrite-claude-code-plugin',
            external: true,
            hideOnClick: true,
            skipUpgradeRedirect: true
        },
        show: true
    };
    listOfPromotions.push(claudePluginPromo);
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
