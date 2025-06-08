<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { calculateEnterpriseTrial, hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { base } from '$app/paths';
    import GradientBanner from '$lib/components/billing/gradientBanner.svelte';
    import { Badge, Typography } from '@appwrite.io/pink-svelte';
    import { activeHeaderAlert } from '../store';

    $: upgradeUrl = `${base}/organization-${$organization?.$id}/change-plan`;
    $: remainingDays = calculateEnterpriseTrial($organization);

    let show = true;

    function handleClose() {
        show = false;
        const now = new Date().getTime();
        localStorage.setItem($activeHeaderAlert.id, now.toString());
    }
</script>

{#if $organization?.$id && remainingDays > 0 && !hideBillingHeaderRoutes.includes(page.url.pathname) && show}
    <GradientBanner variant="image" on:close={handleClose}>
        <div class="banner-fullwidth-grid">
            <Typography.Text>
                Your enterprise trial expires in <Badge
                    variant="secondary"
                    content={remainingDays.toString()} /> days.
            </Typography.Text>

            <Button secondary fullWidthMobile href={upgradeUrl}>Upgrade</Button>
        </div>
    </GradientBanner>
{/if}

<style lang="scss">
    .banner-fullwidth-grid {
        width: 100vw;
        display: grid;
        padding: 0 3rem;
        align-items: center;
        grid-template-columns: 1fr auto 1fr;

        > :global(:first-child) {
            grid-column: 2;
            justify-self: center;

            @media (max-width: 768px) {
                grid-column: unset;
            }
        }

        > :global(:last-child) {
            grid-column: 3;
            justify-self: end;
        }

        @media (max-width: 768px) {
            gap: 12px;
            width: 100%;
            display: flex;
            padding: unset;
            flex-direction: column;
        }
    }
</style>
