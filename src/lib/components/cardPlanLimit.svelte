<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { upgradeURL } from '$lib/stores/billing';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let service: string;
</script>

<article class="card u-grid u-cross-center u-width-full-line">
    <div class="u-flex u-flex-vertical u-gap-24 u-main-center u-cross-center">
        <p class="text u-text-center">Upgrade your plan to add more {service}</p>
        <Button
            secondary
            href={$upgradeURL}
            on:click={() => {
                trackEvent(Click.OrganizationClickUpgrade, { source: 'card_plan_limit' });
            }}>Change plan</Button>
    </div>
</article>
