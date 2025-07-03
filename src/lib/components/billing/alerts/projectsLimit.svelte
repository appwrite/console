<script lang="ts">
    import { page } from '$app/state';
    import { Click } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import {
        billingProjectsLimitDate,
        hideBillingHeaderRoutes,
        upgradeURL
    } from '$lib/stores/billing';
    import { currentPlan } from '$lib/stores/organization';
    import { onMount } from 'svelte';
    import SelectProjectCloud from './selectProjectCloud.svelte';
    let showSelectProject: boolean = $state(false);
    let selectedProjects: string[] = $state([]);
    onMount(() => {
        selectedProjects = page.data.organization?.projects || [];
    });
</script>

<SelectProjectCloud bind:showSelectProject bind:selectedProjects />

{#if $currentPlan && $currentPlan.projects > 0 && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert
        type="warning"
        title="Action required: You have more than {$currentPlan.projects} projects.">
        <svelte:fragment>
            Choose which projects to keep before {billingProjectsLimitDate} or upgrade to Pro. Projects
            over the limit will be blocked after this date.
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
