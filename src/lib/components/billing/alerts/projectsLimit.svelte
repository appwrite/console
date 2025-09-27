<script lang="ts">
    import { page } from '$app/state';
    import { Click } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes, upgradeURL } from '$lib/stores/billing';
    import { currentPlan, organization } from '$lib/stores/organization';
    import SelectProjectCloud from './selectProjectCloud.svelte';
    import { toLocaleDate } from '$lib/helpers/date';

    let selectedProjects: string[] = $state([]);
    let showSelectProject: boolean = $state(false);

    const organizationId = $derived(page.data.organization?.$id);

    $effect(() => {
        if (organizationId) {
            selectedProjects = page.data.organization?.projects || [];
        }
    });
</script>

<SelectProjectCloud bind:showSelectProject bind:selectedProjects {organizationId} />

{#if $currentPlan && $currentPlan.projects > 0 && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert
        type="warning"
        title="Action required: You have more than {$currentPlan.projects} projects.">
        <svelte:fragment>
            Choose which projects to keep before {toLocaleDate(
                $organization.billingNextInvoiceDate
            )} or upgrade to Pro. Projects over the limit will be blocked after this date.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button
                compact
                on:click={() => {
                    showSelectProject = true;
                }}>Manage projects</Button>
            <Button
                href={$upgradeURL}
                event={Click.OrganizationClickUpgrade}
                eventData={{
                    from: 'button',
                    source: 'projects_limit_banner'
                }}
                secondary
                fullWidthMobile>
                <span class="text">Upgrade</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
