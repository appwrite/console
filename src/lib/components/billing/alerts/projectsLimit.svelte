<script lang="ts">
    import { page } from '$app/state';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes, upgradeURL } from '$lib/stores/billing';
    import { currentPlan, projectsCount } from '$lib/stores/organization';
    import { BillingPlan } from '@appwrite.io/console';
</script>

{console.log($projectsCount)}
{#if $currentPlan.$id === BillingPlan.Tier0 && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert title="Action required: You have more than {$currentPlan.projects} projects.">
        <svelte:fragment>
            Choose which projects to keep before [date] or upgrade to Pro. Projects over the limit
            will be blocked after this date.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button text>Manage projects</Button>
            <Button
                href={$upgradeURL}
                on:click={() => {
                    trackEvent(Click.OrganizationClickUpgrade, {
                        from: 'button',
                        source: 'projects_limit_banner'
                    });
                }}
                secondary
                fullWidthMobile>
                <span class="text">Upgrade</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
