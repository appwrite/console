<script lang="ts">
    import { base } from '$app/paths';
    import { browser } from '$app/environment';
    import { HeaderAlert } from '$lib/layout';
    import { organization, currentPlan } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';

    const DISMISS_KEY = 'realtimePricingDismissed';

    let dismissed = browser && localStorage.getItem(DISMISS_KEY) === 'true';

    function handleDismiss() {
        dismissed = true;
        if (browser) {
            localStorage.setItem(DISMISS_KEY, 'true');
        }
    }

    $: href = $currentPlan?.usagePerProject
        ? `${base}/organization-${$organization.$id}/billing`
        : `${base}/organization-${$organization.$id}/usage`;
</script>

{#if $organization?.$id && !dismissed}
    <HeaderAlert
        type="info"
        title="Realtime pricing enforcement starting April 22nd"
        dismissible
        on:dismiss={handleDismiss}>
        <svelte:fragment>
            Starting April 22nd, realtime usage (connections, messages, and bandwidth) will be
            charged based on your plan's rates. Review your usage to avoid unexpected charges.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button {href} text fullWidthMobile>
                <span class="text">View usage</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
